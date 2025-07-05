export default function PrivacyPolicy() {
	return (
		<main className='flex flex-col items-center justify-center p-8 max-w-3xl mx-auto text-gray-800 w-full'>
			<h1 className='text-4xl font-bold mb-6 text-center text-blue-600'>Privacy Policy</h1>
			<p className='mb-4 text-lg text-left w-full'>
				This Privacy Policy explains how <strong>YouTube Annotator</strong> handles your data.
			</p>

			<section className='mb-6 w-full'>
				<h2 className='text-2xl font-semibold mb-2 text-left'>1. Data Collection</h2>
				<p className='text-left'>
					The YouTube Annotator browser extension does <strong>not</strong> collect, store, or share any personal data.
					All annotations you create are saved locally in your browser&apos;s storage and never transmitted to any
					external servers.
				</p>
			</section>

			<section className='mb-6 w-full'>
				<h2 className='text-2xl font-semibold mb-2 text-left'>2. Permissions</h2>
				<p className='text-left'>
					The extension requests access to the active browser tab to retrieve YouTube video URLs when you click on the
					extension button. This is necessary for opening the annotator tool, but no browsing history or other data is
					accessed or collected.
				</p>
			</section>

			<section className='mb-6 w-full'>
				<h2 className='text-2xl font-semibold mb-2 text-left'>3. Third-Party Services</h2>
				<p className='text-left'>We do not use analytics, trackers, or any third-party cookies.</p>
			</section>

			<section className='mb-8 w-full'>
				<h2 className='text-2xl font-semibold mb-2 text-left'>4. Contact</h2>
				<p className='text-left'>
					For questions about this privacy policy, please contact us at: <br />
					<a href='mailto:teambbocho@gmail.com' className='text-blue-500 underline'>
						teambbocho@gmail.com
					</a>
				</p>
			</section>
		</main>
	);
}
