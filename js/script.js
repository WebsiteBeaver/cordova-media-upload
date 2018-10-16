const cmu = new CordovaMediaUpload({
	imageWidth: 700,
	imageHeight: 700,
	videoWidth: 1920,
	videoHeight: 1080
});

const $$ = Dom7;

const app = new Framework7({
	root: '#app',
	name: 'Cordova Messaging',
	routes: [
		{
			path: '/',
			url: 'index.html'
		}
	],
	on: {
		pageInit: page => {
			if(page.name === 'index') {
				const messagebar = app.messagebar.create({
					el: '.messagebar'
				});
				const messages = app.messages.create({
					el: '.messages'
				});

				$$(document).on('click', '.play-video-icon', function(e) {
					setTimeout(() => { $$(this).siblings('.attachment-thumb').click(); }, 100);
				});
				$$(document).on('click', '.attachment-thumb', function() {
					const type = $$(this).data('type');

					if(type === 'video') {
						const videoUri = $$(this).data('video-uri');

						window.plugins.streamingMedia.playVideo(videoUri, {
							errorCallback: error => { app.dialog.alert('Error playing video', 'Error'); },
							shouldAutoClose: false
						});
					} else if(type === 'image') {
						const imgUri = $$(this).attr('src');

						const imagePopup = app.photoBrowser.create({
							toolbar: false,
							theme: 'dark',
							photos: [imgUri],
							on: {
								closed: () => {
									imagePopup.destroy();
								}
							}
						}).open();
					} else {
						app.dialog.alert('Must be video or image', 'Error');
					}
				});

				$$('#attachments').click(() => {
					function addAttachment(imageUri, videoUri) {
						if($$('.messagebar-attachment').length === 0) { //Adding first attachments
							messagebar.attachmentsShow();
							messagebar.setPlaceholder('Add comment or Send');
						}

						$$('.messagebar-attachments').prepend(`
							<div class="messagebar-attachment">
								<img src="${imageUri}" class="attachment-thumb">
								<span class="messagebar-attachment-delete"></span>
							</div>
						`);

						const $img = $$('.messagebar-attachment').eq(0).children('img');

						if(videoUri) {
							$img.attr('data-video-uri', videoUri);
							$img.attr('data-type', 'video');

							$$(`<i class="play-video-icon icon ion-ios-play"></i>`).insertBefore($img);
						} else {
							$img.attr('data-type', 'image');
						}
					}

					messagebar.on('attachmentDelete', (messagebar, attachmentEl, attachmentIndex) => {
						$$(attachmentEl).remove();
						if($$('.messagebar-attachment').length === 0) messagebar.attachmentsHide();
					});

					app.actions.create({
						buttons: [
							[
								{
									text: 'Capture Photo',
									bold: true,
									onClick: async () => {
										try {
											const imageUri = await cmu.capturePhoto();
											addAttachment(imageUri);
										} catch(error) {
											if(error) console.log(error);
										}
									}
								},
								{
									text: 'Capture Video',
									bold: true,
									onClick: async () => {
										try {
											const [imageUri, videoUri] = await cmu.captureVideo();
											addAttachment(imageUri, videoUri);
										} catch(error) {
											if(error) console.log(error);
										}
									}
								},
								{
									text: 'Camera Roll Photo',
									bold: true,
									onClick: async () => {
										try {
											const imageUri = await cmu.getPhoto();
											addAttachment(imageUri);
										} catch(error) {
											if(error) console.log(error);
										}
									}
								},
								{
									text: 'Camera Roll Video',
									bold: true,
									onClick: async () => {
										try {
											const [imageUri, videoUri] = await cmu.getVideo();
											addAttachment(imageUri, videoUri);
										} catch(error) {
											if(error) console.log(error);
										}
									}
								}
							],
							[
								{
									text: 'Cancel',
									color: 'red'
								}
							]
						]
					}).open();
				});

				$$('#send-btn').click(async () => {
					const messagebarAttachmentLength = $$('.messagebar-attachment').length;
					const $img = $$('.messagebar-attachment').children('img');
					const addMsgObjArr = [];
					const videoUriArrObj = {thumbs: [], videos: []};
					const fileUriArr = [];
					const paramsObj = {}; //Parameters sent to server
					const uploadURL = 'https://url-to-upload-files'; //URL to upload to

					if(!messagebarAttachmentLength && !messagebar.getValue()) {
						app.dialog.alert('no text or files');
						return;
					}

					if(messagebarAttachmentLength) { //If any files to upload
						app.dialog.preloader('Uploading');

						$$('.messagebar-attachment').each((index, element) => {
							let $img = $$(element).children('img');

							if($img.data('type') === 'video') {
								videoUriArrObj.thumbs.push($img.attr('src'));
								videoUriArrObj.videos.push($img.data('video-uri'));
							} else {
								fileUriArr.push($img.attr('src'));
							}
						});
					}

					try {
						if(messagebarAttachmentLength) { //If any files to upload
							let attachmentHtml = '';

							//if there are any videos and thumbs and if they are the same length to correlates
							if(cmu.hasVideoAndThumb(videoUriArrObj)) {
								const transcodedVideoUriArr = await cmu.transcodeVideos(videoUriArrObj.videos);

								//replace with transcoded videos
								videoUriArrObj.videos.forEach((videoUri, index, videoArr) => { videoArr[index] = transcodedVideoUriArr[index]; });
							}

							const data = await cmu.uploadFiles(uploadURL, paramsObj, fileUriArr, videoUriArrObj);

							fileUriArr.forEach((fileUri, index) => {
								addMsgObjArr.push({image: `<img src="${fileUriArr[index]}" class="attachment-thumb" data-type="image">`});
							});

							videoUriArrObj.videos.forEach((videoUri, index) => {
								addMsgObjArr.push({image: `
									<i class="play-video-icon icon ion-ios-play"></i>
									<img src="${videoUriArrObj.thumbs[index]}" class="attachment-thumb" data-type="video" data-video-uri="${videoUriArrObj.videos[index]}">
								`});
							});

							app.dialog.close();

							//Clear attachments
							$$('.messagebar-attachments').empty();
							messagebar.attachmentsHide()
						}

						if(messagebar.getValue()) { //If any text
							addMsgObjArr.push({text: messagebar.getValue()});
							messagebar.clear();
						}

						messages.addMessages(addMsgObjArr);
					} catch(error) {
						app.dialog.close();
						if(error) console.log(error);
					}
				});
			}
		}
	}
});

const mainView = app.views.create('.view-main', {
	url: '/'
});