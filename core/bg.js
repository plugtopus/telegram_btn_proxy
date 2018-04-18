var Telebtn = {
    idTelegramWindow: null,
    domains: ["web.telegram.org", "*.telegram.org", "*.web.telegram.org"],
    activeProxy: "HTTPS nl5.postls.com:443",
    proxy: {
        scope: "regular",
        apply: function() {
            chrome.proxy.settings.clear({
                scope: Telebtn.proxy.scope
            }, function() {
                chrome.proxy.settings.set({
                    value: Telebtn.getPac(),
                    scope: Telebtn.proxy.scope
                }, function() {
                    chrome['runtime'].lastError && console.log(chrome['runtime'].lastError.message);
                });
            });
            chrome.proxy.onProxyError.addListener(function(details) {
                console.log("Proxy error:");
                console.log(details);
            });
        }
    },

    init: function() {
        Telebtn.proxy.apply();

        chrome.browserAction.onClicked.addListener(function() {

            if (Telebtn.idTelegramWindow) {
                chrome.windows.update(Telebtn.idTelegramWindow, {
                    focused: true
                }, function(window) {
                    if (chrome['runtime'].lastError) {
                        Telebtn.openTelegramWindow();
                    }
                });
            } else {
                Telebtn.openTelegramWindow();
            }

        });

        setInterval(function() {
            if (Telebtn.idTelegramWindow) {
                chrome.windows.get(Telebtn.idTelegramWindow, function(window) {
                    if (!chrome['runtime'].lastError) {
                        localStorage.telegramWindowWidth = window.width;
                    }
                });
            }
        }, 5000);

    },

    getPac: function() {

        var a = JSON.stringify(Telebtn.domains);
        return {
            mode: "pac_script",
            pacScript: {
                data: `function FindProxyForURL(url, host) { var activeProxy = '` +
                Telebtn.activeProxy + `';	var domains     = ` +
                a + `;for(i = 0; i < domains.length; i++){ if (shExpMatch(host, domains[i])) { return activeProxy;} } return "DIRECT";}`
            }
        };
    },
    openTelegramWindow: function() {

        var telegramWindowX = screen.width - screen.availWidth + 25;
        var telegramWindowY = screen.height - screen.availHeight + 25;

        var telegramWindowWidth = 1050;
        var telegramWindowHeight = screen.height - telegramWindowY - 25;

        if (localStorage.telegramWindowWidth) {
            telegramWindowWidth = Number(localStorage.telegramWindowWidth);
        } else {

            telegramWindowWidth = 1050;
            if (telegramWindowWidth > screen.availWidth) {
                telegramWindowWidth = screen.availWidth;
            } else {
                telegramWindowWidth = Math.max(telegramWindowWidth, Math.round(screen.availWidth * 3 / 4));
            }
        }

        chrome.windows.create({
            'url': 'https://web.telegram.org/#/im',
            'type': 'popup',
            'focused': true,
            'left': telegramWindowX,
            'top': telegramWindowY,
            'width': telegramWindowWidth,
            'height': telegramWindowHeight
        }, function(window) {
            Telebtn.idTelegramWindow = window.id;
        });
    }
};
Telebtn.init();