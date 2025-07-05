// Configuration for the YouTube Annotator extension
const config = {
	// Change this URL based on your environment
	ANNOTATOR_BASE_URL: 'https://annotator-liard.vercel.app', // Development
	// ANNOTATOR_BASE_URL: 'https://yourapp.com', // Production

	// You can add more config options here
	// API_URL: 'https://api.yourapp.com',
	// VERSION: '1.0.0',
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
	module.exports = config;
} else {
	window.config = config;
}
