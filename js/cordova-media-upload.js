/** Cordova wrapper class to help standardize getting photos, videos and audio from your library or by recording and uploading multiple files at once. */
class CordovaMediaUpload {
	/**
	 * CordovaMediaUpload constructor
	 * @class
	 *
	 * @param {object} [optionsObj = {}] - Set options.
	 * @param {int} [optionsObj.imageWidth] - Image width
	 * @param {int} [optionsObj.imageHeight] - Image height
	 * @param {int} [optionsObj.imageQuality = 50] - Image quality as a percent
	 * @param {int} [optionsObj.videoWidth] - Video width
	 * @param {int} [optionsObj.videoHeight] - Video height
	 * @param {int} [optionsObj.videoBitRate = 1000000] - Video bit rate in bits, defaults to 1 megabit (1000000)
	 * @example
	 * const cmu = new CordovaMediaUpload({
	 * 	imageWidth: 700,
	 * 	imageHeight: 700,
	 * 	videoWidth: 1920,
	 * 	videoHeight: 1080
	 * });
	 */
	constructor(optionsObj = {}) {
		this.allowedOptions = ['imageWidth', 'imageHeight', 'imageQuality', 'videoWidth', 'videoHeight', 'videoBitRate'];

		if(this.objHasKeysAndLength) this.optionsObj = optionsObj;
	}

	//"Private" methods

	/**
	 * Get or set new options. When options are set, it doesn't modify the initial values used in the constructor in future use.
	 * @private
	 *
	 * @param {object} [newOptionsObj = {}] - New options to add/modify.
	 * @returns {object} - Either return the existing optionsObj or add/mofidy values for return with newOptionsObj, wihtout changing optionsObj.
	 */
	getOrSetOptions(newOptionsObj = {}) {
		if(this.objHasAllowedKeys(newOptionsObj, this.allowedOptions)) {
			const optionsObjCloned = JSON.parse(JSON.stringify(this.optionsObj));
			return Object.assign(optionsObjCloned, newOptionsObj);
		} else {
			return this.optionsObj;
		}
	}

	/**
	 * Does object have allowed keys.
	 * @private
	 *
	 * @param {object} obj - The object.
	 * @param {string[]} allowedKeys - The allowed keys.
	 * @returns {boolean} - True if is an object with the allowed keys.
	 */
	objHasAllowedKeys(obj, allowedKeys) {
		if(!obj || typeof obj !== 'object' || Array.isArray(obj)) return false; //If falsy, not an object and is an array

		return Object.getOwnPropertyNames(obj).every(i => allowedKeys.includes(i)); //If object contains acceptable keys
	}

	/**
	 * Does array object have thumbs and videos properties, does it have a length and do both thumbs and videos correlate in length
	 * @private
	 *
	 * @param {object} videoUriArrObj - The video and thumbnail URI array object
	 * @param {string[]} videoUriArrObj.thumbs - The video thumbnail URIs
	 * @param {string[]} videoUriArrObj.videos - The video URIs
	 * @returns {boolean} - True if array object has thumbs and videos properties, does it have a length and do both thumbs and videos correlate in length
	 */
	hasVideoAndThumb(videoUriArrObj) {
		return this.objHasAllowedKeys(videoUriArrObj, ['thumbs', 'videos']) && videoUriArrObj.thumbs.length
			&& videoUriArrObj.videos.length && videoUriArrObj.thumbs.length === videoUriArrObj.videos.length;
	}

	/**
	 * Helper class to get all types of media and sources
	 * @private
	 *
	 * @param {object} optionsObj - The options object.
	 * @param {string} mediaType - The media type.
	 * @param {string} sourceType - The source type.
	 * @returns {promise}
	 * @fulfil {string} - The file URI of video, photo or audio clip.
	 * @reject {Error} - If something went wrong getting the file. No error message if user cancelled.
	 */
	getMedia(optionsObj, mediaType, sourceType) {
		return new Promise((resolve, reject) => {
			if(sourceType === 'CAMERA' && mediaType === 'VIDEO') {
				navigator.device.capture.captureVideo(fileUri => {
					let fullPath;

					if(cordova.platformId === 'ios') fullPath = 'file://' + fileUri[0].fullPath;
					else fullPath = fileUri[0].fullPath;

					resolve([fullPath, optionsObj]);
				}, error => {
					if(error.code === CaptureError.CAPTURE_NO_MEDIA_FILES) reject();
					else reject('error getting video');
				});
			} else if(mediaType === 'AUDIO') {
				navigator.device.capture.captureAudio(fileUri => {
					let fullPath;

					if(cordova.platformId === 'ios') fullPath = 'file://' + fileUri[0].fullPath;
					else fullPath = fileUri[0].fullPath;

					resolve(fullPath);
				}, error => {
					if(error.code === CaptureError.CAPTURE_NO_MEDIA_FILES) reject();
					else reject('error getting audio');
				});
			} else {
				navigator.camera.getPicture(fileUri => {
					if(mediaType === 'VIDEO') {
						resolve(['file://' + fileUri, optionsObj]);
					} else if(mediaType === 'PICTURE') {
						resolve(fileUri);
					}
				}, error => {
					if(error === 'No Image Selected' || error === 'has no access to assets') reject();
					else reject('error getting file');
				}, {
					correctOrientation: true,
					targetWidth: optionsObj.imageWidth,
					targetHeight: optionsObj.imageHeight,
					quality: optionsObj.imageQuality,
					saveToPhotoAlbum: false,
					sourceType: navigator.camera.PictureSourceType[sourceType],
					mediaType: navigator.camera.MediaType[mediaType]
				});
			}
		});
	}

	/**
	 * Create video thumbnail
	 * @private
	 *
	 * @param {string} videoUri - The video URI.
	 * @param {object} optionsObj - The options object.
	 * @returns {promise}
	 * @fulfil {array} [`string` imageUri, `string` videoUri] - The image and video file URI.
	 * @reject {Error} - If something went wrong creating the video thumbnail.
	 */
	createVideoThumbnail(videoUri, optionsObj) {
		return new Promise((resolve, reject) => {
			VideoEditor.createThumbnail(imageUri => {
				resolve(['file://' + imageUri, videoUri]);
			}, error => {
				reject('error creating thumbnail');
			}, {
				fileUri: videoUri,
				outputFileName: 'video_thumbs' + new Date().getTime(),
				atTime: 0,
				width: optionsObj.imageWidth,
				height: optionsObj.imageHeight,
				quality: optionsObj.imageQuality
			});
		});
	}

	/**
	 * Convert file URI to blob to upload with formData.
	 * @private
	 *
	 * @param {string} fileUri - The file URI.
	 * @returns {promise}
	 * @fulfil {string} - The file URI converted to blob.
	 * @reject {Error} - If something went wrong resolving or getting file.
	 */
	fileUriToBlobPromise(fileUri) {
		return new Promise((resolve, reject) => {
			window.resolveLocalFileSystemURL(fileUri, fileEntry => {
				fileEntry.file(file => {
					const reader = new FileReader();

					reader.onloadend = function() {
						const blob = new Blob([new Uint8Array(this.result)]);
						resolve(blob);
					};

					reader.readAsArrayBuffer(file);
				}, () => {
					reject('Error getting file');
					return;
				});
			}, () => {
				reject('Error resolving file');
				return;
			});
		});
	}

	/**
	 * Convert multiple file URIs to blobs to upload with formData.
	 * @private
	 *
	 * @param {string[]} fileUris - The file URI array.
	 * @returns {promise}
	 * @fulfil {string[]} - The file URIs converted to blob array.
	 * @reject {Error} - If something went wrong resolving or getting file.
	 */
	async fileUrisToBlobs(fileUris) {
		const promiseArr = [];

		fileUris.forEach(fileUri => {
			promiseArr.push(this.fileUriToBlobPromise(fileUri))
		});

		return await Promise.all(promiseArr);
	}

	/**
	 * Transcode video.
	 * @private
	 *
	 * @param {string} videoUri - The video URI.
	 * @param {object} optionsObj - The options object.
	 * @returns {promise}
	 * @fulfil {string} - The video URI transcoded.
	 * @reject {Error} - If something went wrong trancoding video URI.
	 */
	transcodeVideoPromise(videoUri, newOptionsObj) {
		return new Promise((resolve, reject) => {
			const clonedObj = this.getOrSetOptions(newOptionsObj);

			VideoEditor.transcodeVideo(transcodedVideoUri => {
				resolve('file://' + transcodedVideoUri);
			}, () => {
				reject('Error transcoding video');
				return;
			},
			{
				 fileUri: videoUri,
				 outputFileName: 'videos' + new Date().getTime(),
				 outputFileType: VideoEditorOptions.OutputFileType.MPEG4,
				 width: clonedObj.videoWidth,
				 height: clonedObj.videoHeight,
				 videoBitrate: clonedObj.videoBitRate,
				 saveToLibrary: false
			});
		});
	}

	/**
	 * Delete file.
	 * @private
	 *
	 * @param {string} fileUri - The file URI.
	 * @returns {promise}
	 * @fulfil - The file URI has been deleted.
	 * @reject {Error} - If something went wrong resolving or deleting file.
	 */
	deleteFilePromise(fileUri) {
		return new Promise((resolve, reject) => {
			window.resolveLocalFileSystemURL(fileUri, fileEntry => {
				fileEntry.remove(() => {
					resolve();
				}, () => {
					reject('Error deleting');
					return;
				});
			}, () => {
				reject('Error reading file');
				return;
			});
		});
	}

	//"Public" methods

	/**
	 * Take a photo with the camera.
	 *
	 * @param {object} [newOptionsObj = {}] - New options to set or change.
	 * @returns {promise}
	 * @fulfil {string} - Local file URI for photo.
	 * @reject {Error} - Rejected promise with message. No message if user cancelled.
	 * @example
	 * cmu.capturePhoto()
	 *   .then(fileUri => {})
	 *   .catch(error => { if(error) console.log('error'); });
	 */
	capturePhoto(newOptionsObj = {}) {
		return this.getMedia(this.getOrSetOptions(newOptionsObj), 'PICTURE', 'CAMERA');
	}

	/**
	 * Get existing photo from library.
	 *
	 * @param {object} [newOptionsObj = {}] - New options to set or change.
	 * @returns {promise}
	 * @fulfil {string} - Local file URI for photo.
	 * @reject {Error} - Rejected promise with message. No message if user cancelled.
	 * @example
	 * cmu.getPhoto()
	 *   .then(fileUri => {})
	 *   .catch(error => { if(error) console.log('error'); });
	 */
	getPhoto(newOptionsObj = {}) {
		return this.getMedia(this.getOrSetOptions(newOptionsObj), 'PICTURE', 'PHOTOLIBRARY');
	}

	/**
	 * Record video.
	 *
	 * @param {object} [newOptionsObj = {}] - New options to set or change.
	 * @returns {promise}
	 * @fulfil {array} [`string` imageUri, `string` videoUri] - The image and video file URI.
	 * @reject {Error} - Rejected promise with message. No message if user cancelled.
	 * @example
	 * cmu.captureVideo()
	 *   .then([imageUri, videoUri] => {})
	 *   .catch(error => { if(error) console.log('error'); });
	 */
	async captureVideo(newOptionsObj = {}) {
		const [videoUri, optionsObj] = await this.getMedia(this.getOrSetOptions(newOptionsObj), 'VIDEO', 'CAMERA');
		return await this.createVideoThumbnail(videoUri, optionsObj);
	}

	/**
	 * Get existing video from library.
	 *
	 * @param {object} [newOptionsObj = {}] - New options to set or change.
	 * @returns {promise}
	 * @fulfil {array} [`string` imageUri, `string` videoUri] - The image and video file URI.
	 * @reject {Error} - Rejected promise with message. No message if user cancelled.
	 * @example
	 * cmu.getVideo()
	 *   .then([imageUri, videoUri] => {})
	 *   .catch(error => { if(error) console.log('error'); });
	 */
	async getVideo(newOptionsObj = {}) {
		const [videoUri, optionsObj] = await this.getMedia(this.getOrSetOptions(newOptionsObj), 'VIDEO', 'PHOTOLIBRARY');
		return await this.createVideoThumbnail(videoUri, optionsObj);
	}

	/**
	 * Record audio.
	 *
	 * @returns {promise}
	 * @fulfil {string} - Local file URI for photo.
	 * @reject {Error} - Rejected promise with message. No message if user cancelled.
	 * @example
	 * cmu.captureAudio()
	 *   .then(fileUri => {})
	 *   .catch(error => { if(error) console.log('error'); });
	 */
	captureAudio() {
		return this.getMedia(this.optionsObj, 'AUDIO');
	}

	/**
	 * Transcoode video.
	 *
	 * @param {string[]|string} videoUris - Local video URIs to transcode.
	 * @param {object} [newOptionsObj = {}] - New options to set or change.
	 * @returns {promise}
	 * @fulfil {string[]} - Array of transcoded video URIs.
	 * @reject {Error} - Rejected promise with message. No message if user cancelled.
	 * @example
	 * cmu.transcodeVideos()
	 *   .then(videoUris => {})
	 *   .catch(error => { if(error) console.log('error'); });
	 */
	async transcodeVideos(videoUris, newOptionsObj = {}) {
		if(!Array.isArray(videoUris)) videoUris = [videoUris]; //Convert to array if scalar

		const promiseArr = [];

		videoUris.forEach(videoUri => {
			promiseArr.push(this.transcodeVideoPromise(videoUri, newOptionsObj));
		});

		return await Promise.all(promiseArr);
	}

	/**
	 * Upload files.
	 *
	 * @param {string} serverUrl - URL to upload files to.
	 * @param {object} paramsObj - parameters to send to server.
	 * @param {string[]|string} fileUris - Local video URIs to upload.
	 * @param {object} [videoUriArrObj = {}] - The video and thumbnail URI array object
	 * @param {string[]} [videoUriArrObj.thumbs] - The video thumbnail URIs
	 * @param {string[]} [videoUriArrObj.videos] - The video URIs
	 * @returns {promise}
	 * @fulfil {object[]} - JSON data from server.
	 * @reject {Error} - Fail to convert files to blobs.
	 * @example
	 * const serverUrl = 'https://url-to-upload-files';
	 * const paramsObj = {}; //Parameters sent to server
	 * cmu.uploadFiles(serverUrl, paramsObj, fileUris)
	 *   .then(data => {})
	 *   .catch(error => { if(error) console.log('error'); });
	 */
	async uploadFiles(serverURL, paramsObj, fileUris, videoUriArrObj = {}) {
		if(!Array.isArray(fileUris)) fileUris = [fileUris]; //Convert to array if scalar

		//If variable is truthy, but doesn't have the required object properties or doesn't correlate lengths
		if(videoUriArrObj && !this.hasVideoAndThumb(videoUriArrObj)) {
			throw new Error('videoUriArrObj must be an array object with "video" and "thumb" as properties and correlate');
		}

		const formData = new FormData();
		for(const key in paramsObj) {
			formData.append(key, paramsObj[key]); //Add parameters to formData
		}

		function appendFiles(blobArr, fileName) {
			if(blobArr && blobArr.length > 1) {
				blobArr.forEach(blob => {
					formData.append(fileName + '[]', blob); //Server-side page will have a file array
				});
			} else {
				formData.append(fileName, blobArr[0]); //Server-side page will a single file
			}
		}

		if(fileUris) {
			const fileBlobArr = await this.fileUrisToBlobs(fileUris);
			appendFiles(fileBlobArr, 'file');
		}

		if(this.hasVideoAndThumb(videoUriArrObj)) {
			const videoThumbBlobArr = await this.fileUrisToBlobs(videoUriArrObj.thumbs);
			const videoBlobArr = await this.fileUrisToBlobs(videoUriArrObj.videos);

			appendFiles(videoThumbBlobArr, 'video_thumb');
			appendFiles(videoBlobArr, 'video');
		}

		const response = await fetch(serverURL, {method: 'post', body: formData});
		if(!response.ok) throw new Error('Server error');
		return await response.json();
	}

	/**
	 * Delete files.
	 *
	 * @param {string[]|string} fileUris - Local video URI to transcode.
	 * @returns {promise}
	 * @fulfil - The file URI has been deleted.
	 * @reject {Error} - Rejected promise with message.
	 * @example
	 * cmu.deleteFiles(fileUris)
	 *   .then(() => {})
	 *   .catch(error => { if(error) console.log('error'); });
	 */
	async deleteFiles(fileUris) {
		if(!Array.isArray(fileUris)) fileUris = [fileUris]; //Convert to array if scalar

		const promiseArr = [];

		fileUris.forEach(fileUri => {
			promiseArr.push(this.deleteFilePromise(fileUri));
		});

		return await Promise.all(promiseArr);
	}
}