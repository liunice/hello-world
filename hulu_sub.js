(async () => {
    // const subtitleHost = 'http://192.168.1.189';
    const subtitleHost = 'http://home.miffysoft.cn:8000'
    const $ = Env("hulu_sub.js");

    if (/\/content\/v\d+\/hubs\/series\/([\w\-]+)\/season\/\d+\?/.test($request.url)) {
        const root = JSON.parse($response.body);
        addEpisodes(root.items)
    }
    else if (/\/content\/v\d+\/hubs\/series\/([\w\-]+)\?/.test($request.url)) {
        const root = JSON.parse($response.body);
        for (const itms of root.components[0].items) {
            if (itms.items.length && itms.items[0]['_type'] == 'episode') {
                addEpisodes(itms.items)
                break
            }
        }
    }
    else if (/\/content\/v\d+\/hubs\/movie\/([\w\-]+)\?/.test($request.url)) {
        const root = JSON.parse($response.body);
        const entity = root['details']['vod_items']['focus']['entity']
        const movie = {
            "is_movie": true,
            "season": '1',
            "episode": '1',
            "asset_id": entity['personalization']['eab'].split('::')[2],
            "series_id": entity['id'],
            "series_name": entity['name'],
            "episode_name": entity['name']
        }
        const opts = {
            'url': 'https://api.miffysoft.cn/tv_shows/episodes/add?platform=hulu',
            'headers': { 'Content-Type': 'application/json' },
            'body': JSON.stringify([movie])
        }
        $.http.post(opts).then(resp => {
            $.log(resp.body)
            const root = JSON.parse(resp.body)
            if (root.count) {
                notify('Hulu外挂字幕', '电影信息已保存', entity['name'])
            }
            $.done({})
        })
    }
    else if (/\/subtitles\/(.*?)\/S\d{2}\/(S\d{2}E\d{2})\.vtt$/.test($request.url)) {
        // get subtitle config (if any)
        let offset = 0
        const epInfo = /(S\d{2}E\d{2})\.vtt$/i.exec($request.url)[1]
        try {
            // var confBody = await getBody(subtitleHost + $request.path.replace(/S\d{2}E\d{2}\.vtt$/i, 'subtitle.conf'))
            var confBody = await getBody(subtitleHost + /(\/subtitles\/[^\/]+\/S\d{2})\//.exec($request.url)[1] + '/subtitle.conf')
            $.log(confBody)
            const off = getConfig(confBody, 'offset', epInfo)
            if (off) {
                offset += parseInt(off)
            }

            if (getConfig(confBody, 'strip_trailers', epInfo) == 'false') {
                // subtitle contains trailer
                offset -= parseInt($.getdata('trailers_duration') || '0')
            }
            $.log('offset = ' + offset)
        }
        catch (err) {
            $.log(err)
            $.done({})
        }

        // download srt
        //const srtBody = await getBody(subtitleHost + $request.path.replace(/\.vtt$/, '.srt'))
        const srtBody = await getBody(subtitleHost + /(\/subtitles\/[^\/]+\/S\d{2}\/S\d{2}E\d{2})/.exec($request.url)[1] + '.srt')
        $.log("srt字幕下载成功！")

        // generate webvtt
        var vttBody = 'WEBVTT\r\n\r\n'
        let lines = srtBody.split('\r\n')
        // $.log(lines)
        for (const line of lines) {
            vttBody += line.replace(/\d{2}:\d{2}:\d{2}\,\d{3}/g, str => msToStr(strToMS(str) + offset)) + '\r\n'
        }
        $.log(vttBody)

        // return response
        var newHeaders = $request.headers;
        newHeaders['Content-Type'] = 'application/vnd.apple.mpegurl';
        if ($.isQuanX()) {
            $.done({ body: vttBody, headers: newHeaders, status: 'HTTP/1.1 200 OK' })
        }
        else {
            $.done({ body: vttBody, headers: newHeaders, status: 200 })
        }
    }
    else if (/manifest\-dp\.hulustream\.com\/hls\/\d+\.m3u8\?.*?&auth=\w+$/.test($request.url)) {
        const body = $response.body
        // force highest bitrate
        // #EXT-X-STREAM-INF:BANDWIDTH=7428365,RESOLUTION=1920x1080,AVERAGE-BANDWIDTH=3185815,CODECS="avc1.640028,mp4a.40.5",FRAME-RATE=23.976,AUDIO="da-audio-AAC",SUBTITLES="subs",VIDEO-RANGE="SDR"
        const hdr = $request.url.indexOf('&__enable_hdr=true') > -1
        const range = hdr ? '(PQ|SDR)' : '(SDR)'
        const vcodecs = hdr ? '(?:dvh|avc|hvc|hev)' : '(?:avc|hvc|hev)'
        const resolution = RegExp(String.raw`RESOLUTION=3840x2160,.*?VIDEO-RANGE="${range}"`).test(body) ? '3840x2160' : '1920x1080'
        const bitrates = [...body.matchAll(RegExp(String.raw`#EXT-X-STREAM-INF:BANDWIDTH=(\d+),RESOLUTION=${resolution},AVERAGE-BANDWIDTH=\d+,CODECS="${vcodecs}[^"]+".*?,VIDEO-RANGE="${range}"\s+https:\/\/.+`, 'g'))].map(s => parseInt(s[1]))
        const maxrate = Math.max(...bitrates)
        const m = RegExp(String.raw`#EXT-X-STREAM-INF:BANDWIDTH=(${maxrate}),RESOLUTION=${resolution},AVERAGE-BANDWIDTH=\d+,CODECS="(${vcodecs}[^"]+)".*?,VIDEO-RANGE="${range}"\s+(https:\/\/.+)`, 'g').exec(body)
        if (m) {
            $.log(`found ${resolution} with url:`, m[4])
            $.setdata(m[4], 'hulu_hd_hls_url')
            notify('Hulu外挂字幕', `已强制${resolution}`, `BANDWIDTH=${numberWithCommas(m[1])},CODECS="${m[2]}",VIDEO-RANGE=${m[3]}`)
        }
        else {
            $.setdata('', 'hulu_hd_hls_url')
        }
        $.done({})
    }
    // else if (/manifest\-dp\.hulustream\.com\/v\d+\/hls\/\d+\/.*?\.m3u8\?.*?&auth=\w+$/.test($request.url)) {
    //     const hd_url = ($.getdata('hulu_hd_hls_url') || $request.url) + '&__force_bitrate=true'
    //     const status = $.isQuanX() ? "HTTP/1.1 302 Moved Temporarily" : 302;
    //     const headers = { "Location": hd_url };
    //     const resp = {
    //         status: status,
    //         headers: headers
    //     }
    //     $.log('video hls url redirected to:', hd_url)
    //     $.done(resp)
    // }
    else if (/\/webvtt\?asset_id=(\d+)/.test($request.url)) {
        const asset_id = /\/webvtt\?asset_id=(\d+)/.exec($request.url)[1]
        const epBody = await getBody(`https://api.miffysoft.cn/tv_shows/episode/?platform=hulu&asset_id=${asset_id}`)
        const root = JSON.parse(epBody)
        if (!root) {
            notify('Hulu外挂字幕', `asset_id = ${asset_id}`, '数据库未保存相关信息')
            $.done({});
        }

        const seriesName = root['series_name']
        const seasonNo = root['season'].padStart(2, '0')
        const epNo = root['episode'].padStart(2, '0')
        if (root.is_movie) {
            notify('Hulu外挂字幕', '正在播放电影', seriesName)
        }
        else {
            notify('Hulu外挂字幕', '正在播放剧集', `[${seriesName}] S${seasonNo}E${epNo}`)
        }

        const body = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:36000
#EXTINF:36000.000,
https://manifest-dp.hulustream.com/subtitles/${encodeURIComponent(seriesName)}/S${seasonNo}/S${seasonNo}E${epNo}.vtt
#EXT-X-ENDLIST
`
        $.done({ body: body })
    }
    else if (/manifest\-dp\.hulustream\.com\/v\d+\/hls\/\d+\/.*?\.m3u8\?.*?&auth=\w+$/.test($request.url)) {
        let body = $response.body
        // download hd m3u8 for video
        if (body.indexOf('_audio.mp4?') == -1) {
            const hd_url = $.getdata('hulu_hd_hls_url')
            if (hd_url && $request.url != hd_url) {
                $.log('using hd video url:', hd_url)
                body = await getBody(hd_url)
            }
        }

        // strip all previously, trailers from the beginning
        body = body.replace(/^([\s\S]*?#EXT\-X\-TARGETDURATION:\d+)[\s\S]*?(#EXT\-X\-KEY:METHOD=[\s\S]*?)$/, '$1\r\n$2')
        // console.log(body)

        // calculate trailer duration (only once)
        if (body.indexOf('_audio.mp4?') == -1) {
            let duration = 0
            const mid = /^([\s\S]*?#EXT\-X\-TARGETDURATION:\d+)([\s\S]*?)(#EXT\-X\-KEY:METHOD=[\s\S]*?)$/.exec(body)
            if (mid) {
                // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
                const parts = [...mid[2].matchAll(/#EXTINF:([\d\.]+)\,/g)]
                for (const part of parts) {
                    duration += Math.round(parseFloat(part[1]) * 1000)
                }
                $.log('trailers_duration = ' + duration)
            }
            $.setdata(duration.toString(), 'trailers_duration')
        }

        $.done({ body: body })
    }

    function addEpisodes(items) {
        let episodes = []
        for (const ep of items) {
            episodes.push(
                {
                    "season": ep['season'],
                    "episode": ep['number'],
                    "asset_id": ep['personalization']['eab'].split('::')[2],
                    "series_id": ep['series_id'],
                    "series_name": ep['series_name'],
                    "episode_name": ep['name']
                }
            )
        }
        const opts = {
            'url': 'https://api.miffysoft.cn/tv_shows/episodes/add?platform=hulu',
            'headers': { 'Content-Type': 'application/json' },
            'body': JSON.stringify(episodes)
        }
        $.http.post(opts).then(resp => {
            $.log(resp.body)
            const root = JSON.parse(resp.body)
            if (root.count) {
                notify('Hulu外挂字幕', `剧集信息已保存 (共${root.count}集)`, `[${episodes[0]['series_name']}] Season ${episodes[0]['season']}`)
            }
            $.done({})
        })
    }

    function notify(title, subtitle, message, to_phone = true) {
        $.msg(title, subtitle, message)

        const opts = {
            'url': 'http://localhost:8088/message?token=AIo_LwIt94c6894',
            'body': { title: `${title} - ${subtitle}`, message: message }
        }
        $.http.post(opts).then(resp => {
            $.log('[Gotify]', resp.body)
        })
    }

    function getBody(url) {
        return $.http.get(url).then(resp => resp.body)
    }

    function getConfig(confBody, key, epInfo) {
        const realKey = epInfo ? `${epInfo}:${key}=(.+)` : `${key}=(\\.+)`
        const m = new RegExp(realKey, 'i').exec(confBody)
        if (m) {
            return m[1]
        }
        else if (epInfo) {
            const m0 = new RegExp(`${key}=(.+)`, 'i').exec(confBody)
            return m0 ? m0[1] : null
        }
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function msToStr(ms, webvtt = true) {
        // 00:00:10,120
        const hour = Math.floor(ms / (60 * 60 * 1000))
        const minutes = Math.floor((ms - hour * 60 * 60 * 1000) / (60 * 1000))
        const seconds = Math.floor((ms - hour * 60 * 60 * 1000 - minutes * 60 * 1000) / (1000))
        const milliseconds = ms % 1000
        return hour.toString().padStart(2, '0')
            + ':' + minutes.toString().padStart(2, '0')
            + ':' + seconds.toString().padStart(2, '0')
            + (webvtt ? '.' : ',') + milliseconds.toString().padStart(3, '0')
    }

    function strToMS(str, webvtt = false) {
        // 00:00:10,120
        const pts = str.split(webvtt ? '.' : ',')
        var ts = parseInt(pts[1])
        const parts = pts[0].split(':')
        for (const [i, val] of parts.entries()) {
            ts += 1000 * (60 ** (2 - i)) * parseInt(val);
        }
        return ts
    }

    // prettier-ignore
    /*********************************** BoxJS API *************************************/
    function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, n] = i.split("@"), a = { url: `http://${n}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), n = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(n); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: n } = t, a = s.decode(n, this.encoding); e(null, { status: i, statusCode: r, headers: o, rawBody: n, body: a }, a) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: n } = t, a = i.decode(n, this.encoding); e(null, { status: s, statusCode: r, headers: o, rawBody: n, body: a }, a) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let i = t[s]; null != i && "" !== i && ("object" == typeof i && (i = JSON.stringify(i)), e += `${s}=${i}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), this.isSurge() || this.isQuanX() || this.isLoon() ? $done(t) : this.isNode() && process.exit(1) } }(t, e) }
    /*****************************************************************************/
})()