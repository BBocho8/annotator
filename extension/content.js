// Content script that runs on YouTube pages
(() => {
	// Extract video ID from YouTube URL
	function getVideoId() {
		const url = window.location.href;
		const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
		return match ? match[1] : null;
	}

	// Check if we're on a video page
	function isVideoPage() {
		return window.location.pathname === '/watch' && getVideoId();
	}

	// Create floating button
	function createAnnotatorButton() {
		if (!isVideoPage()) return;

		const button = document.createElement('div');
		button.innerHTML = `
      <div style="
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 25px;
        cursor: pointer;
        font-family: 'YouTube Sans', Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <span style="font-size: 16px;">🎨</span>
        Open in Annotator
      </div>
    `;

		// Add click handler
		button.addEventListener('click', () => {
			const videoId = getVideoId();
			if (videoId) {
				// You can either redirect or open in new tab
				// window.location.href = `https://annotator-liard.vercel.app/?videoId=${videoId}`;
				window.open(`https://annotator-liard.vercel.app/?videoId=${videoId}`, '_blank');
			}
		});

		document.body.appendChild(button);
	}

	// Wait for page to load and create button
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', createAnnotatorButton);
	} else {
		createAnnotatorButton();
	}

	// Handle YouTube's SPA navigation
	let currentUrl = window.location.href;
	const observer = new MutationObserver(() => {
		if (window.location.href !== currentUrl) {
			currentUrl = window.location.href;
			// Remove existing button and create new one
			const existingButton = document.querySelector('[data-annotator-button]');
			if (existingButton) existingButton.remove();
			setTimeout(createAnnotatorButton, 1000); // Wait for page to settle
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });
})();
