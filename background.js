function addPageLink(pageRegexp, imageRegexp, urls) {
	chrome.webRequest.onBeforeRequest.addListener(
		function (details) {
			var res = pageRegexp.exec(details.url);
			if (res) {
				var redirect;
				var xhr = new XMLHttpRequest();
				xhr.open('GET', details.url, false);
				xhr.onload = function (e) {
					var res = imageRegexp.exec(e.target.response);
					if (res) {
						redirect = res[1];
					}
				}
				xhr.send();
				if (redirect) {
					return {redirectUrl: redirect};
				}
			}
		},
		{
			urls: urls
		},
		['blocking']
	);
}

function addSimpleRedirect(pageRegexp, urlCallback, urls) {
	chrome.webRequest.onBeforeRequest.addListener(
		function (details) {
			var res = pageRegexp.exec(details.url);
			if (res) {
				var url = urlCallback(res);
				return {redirectUrl: url};
			}
		},
		{
			urls: urls
		},
		['blocking']
	);
}

// === fastpic.ru ===

addSimpleRedirect(
	/^http:\/\/fastpic\.ru\/view\/(\d+)(\/\d+\/\d+)(\/[a-z0-9]+)([a-z0-9]{2})(\.(?:gif|jpeg|jpg|png))\.html$/,
	function (res) { return 'http://i' + res[1] + '.fastpic.ru/big' + res[2] + '/' + res[4] + res[3] + res[4] + res[5] },
	[
		'http://fastpic.ru/view/*.html'
	]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
	function (details) {
		for (var i = 0, l = details.requestHeaders.length; i < l; i++) {
			if (details.requestHeaders[i].name === 'Referer') {
				details.requestHeaders.splice(i, 1);
				break;
			}
		}
		details.requestHeaders.push({
			name: 'Referer',
			value: 'http://fastpic.ru/'
		});
		return {requestHeaders: details.requestHeaders};
	},
	{
		urls: [
			'http://*.fastpic.ru/*.gif',
			'http://*.fastpic.ru/*.jpg',
			'http://*.fastpic.ru/*.jpeg',
			'http://*.fastpic.ru/*.png'
		]
	},
	['blocking', 'requestHeaders']
);

// === www.imagebam.com ===

addPageLink(
	/http:\/\/www\.imagebam\.com\/image\/[a-z0-9]+$/,
	/src="(http:\/\/\d+\.imagebam\.com\/download\/[^"]+)"/,
	[
		'http://www.imagebam.com/image/*'
	]
);

chrome.webRequest.onHeadersReceived.addListener(
	function (details) {
		for (var i = 0, l = details.responseHeaders.length; i < l; i++) {
			if (details.responseHeaders[i].name === 'Content-Disposition') {
				details.responseHeaders.splice(i, 1);
				break;
			}
		}
		return {responseHeaders: details.responseHeaders};
	},
	{
		urls: [
			'http://*.imagebam.com/*'
		]
	},
	['blocking', 'responseHeaders']
);

// === imageban.ru ===

addPageLink(
	/http:\/\/imageban\.ru\/show\/\d+\/\d+\/\d+\/[a-z0-9]+\/(?:gif|jpeg|jpg|png)$/,
	/src="(http:\/\/(i\d+\.)?imageban\.ru\/out\/\d+\/\d+\/\d+\/[a-z0-9]+\.(?:gif|jpeg|jpg|png))"/,
	[
		'http://imageban.ru/show/*'
	]
);

// === imageshost.ru ===

addPageLink(
	/http:\/\/imageshost\.ru\/photo\/\d+\/id\d+\.html$/,
	/src="(http:\/\/img\d+\.imageshost\.ru\/img\/\d+\/\d+\/\d+\/image_[a-z0-9]+\.(?:gif|jpeg|jpg|png))"/,
	[
		'http://imageshost.ru/*.html'
	]
);

// === imgdepo.ru ===

addSimpleRedirect(
	/^http:\/\/imgdepo\.ru\/show\/(\d+)$/,
	function (res) { return 'http://imgdepo.ru/id/i' + res[1] },
	[
		'http://imgdepo.ru/show/*'
	]
);

// === radikal.ru ===

addSimpleRedirect(
	/^http:\/\/radikal\.ru\/F\/([a-z0-9.\/]+\.(?:gif|jpeg|jpg|png))\.html$/,
	function (res) { return 'http://' + res[1] },
	[
		'http://radikal.ru/*'
	]
);
