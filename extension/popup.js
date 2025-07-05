document.getElementById("open").addEventListener("click", () => {
	const url = document.getElementById("url").value
	const videoId = extractVideoId(url)
	if (videoId) {
		const annotatorUrl = `https://yourapp.com/?videoId=${videoId}`
		chrome.tabs.create({ url: annotatorUrl })
	} else {
		alert("Please enter a valid YouTube URL")
	}
})

function extractVideoId(url) {
	try {
		const u = new URL(url)
		return u.searchParams.get("v")
	} catch {
		return null
	}
}
