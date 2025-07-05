const input = document.getElementById('url');
const button = document.getElementById('open');

// Focus input on popup open
input.focus();

// Check if current tab is on YouTube and extract video ID
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
	const currentTab = tabs[0];
	if (currentTab?.url?.includes('youtube.com/watch')) {
		const videoId = extractVideoId(currentTab.url);
		if (videoId) {
			// Pre-fill the input with the current video URL
			input.value = currentTab.url;

			// Optionally, you could auto-click the button or show a different message
			// button.textContent = "Open Current Video in Annotator";
		}
	}
});

// Allow Enter key to submit
input.addEventListener('keydown', e => {
	if (e.key === 'Enter') button.click();
});

button.addEventListener('click', () => {
	const url = input.value.trim();
	const videoId = extractVideoId(url);
	if (videoId) {
		const annotatorUrl = `${config.ANNOTATOR_BASE_URL}/?videoId=${videoId}`;
		chrome.tabs.create({ url: annotatorUrl });
	} else {
		input.classList.add('error');
		input.value = '';
		input.placeholder = 'Please enter a valid YouTube URL';
		input.focus();
	}
});

function extractVideoId(url) {
	// Support various YouTube URL formats
	const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
	return match ? match[1] : null;
}
