## Prerequisites

You'll need to use the following Cordova plugins:
- [Cordova Camera](https://github.com/apache/cordova-plugin-camera) - Take photo with camera and get photos/videos from library. Can't be used to record video or audio currently.
- [Cordova Media Capture](https://github.com/apache/cordova-plugin-media-capture) - Record video and audio.
- [Cordova File](https://github.com/apache/cordova-plugin-file) - File API used to upload and delete.
- [Cordova Video Editor](https://github.com/jbavari/cordova-plugin-video-editor) - Transcode video and create video preview thumbnails.

To add these plugins, run the following commands on your terminal.

```
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-media-capture
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-video-editor
```

This is all you need if you're just using the Cordova Media Upload plugin, which can be found in [js/cordova-media-upload.js](js/cordova-media-upload.js). This entire repo is that plus a messaging demo you can try out on a blank Cordova project and uses Framework7. The demo also use the [Cordova Streaming Media](https://github.com/nchutchind/cordova-plugin-streaming-media) plugin to preview videos in the messaging system.

<a name="CordovaMediaUpload"></a>

## CordovaMediaUpload
Cordova wrapper class to help standardize getting photos, videos and audio from your library or by recording and uploading multiple files at once.

**Kind**: global class  

* [CordovaMediaUpload](#CordovaMediaUpload)
    * [new CordovaMediaUpload([optionsObj])](#new_CordovaMediaUpload_new)
    * [.capturePhoto([newOptionsObj])](#CordovaMediaUpload+capturePhoto) ⇒ <code>promise</code>
    * [.getPhoto([newOptionsObj])](#CordovaMediaUpload+getPhoto) ⇒ <code>promise</code>
    * [.captureVideo([newOptionsObj])](#CordovaMediaUpload+captureVideo) ⇒ <code>promise</code>
    * [.getVideo([newOptionsObj])](#CordovaMediaUpload+getVideo) ⇒ <code>promise</code>
    * [.captureAudio()](#CordovaMediaUpload+captureAudio) ⇒ <code>promise</code>
    * [.transcodeVideos(videoUris, [newOptionsObj])](#CordovaMediaUpload+transcodeVideos) ⇒ <code>promise</code>
    * [.uploadFiles(serverUrl, paramsObj, fileUris, [videoUriArrObj])](#CordovaMediaUpload+uploadFiles) ⇒ <code>promise</code>
    * [.deleteFiles(fileUris)](#CordovaMediaUpload+deleteFiles) ⇒ <code>promise</code>

<a name="new_CordovaMediaUpload_new"></a>

### new CordovaMediaUpload([optionsObj])
CordovaMediaUpload constructor


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [optionsObj] | <code>object</code> | <code>{}</code> | Set options. |
| [optionsObj.imageWidth] | <code>int</code> |  | Image width |
| [optionsObj.imageHeight] | <code>int</code> |  | Image height |
| [optionsObj.imageQuality] | <code>int</code> | <code>50</code> | Image quality as a percent |
| [optionsObj.videoWidth] | <code>int</code> |  | Video width |
| [optionsObj.videoHeight] | <code>int</code> |  | Video height |
| [optionsObj.videoBitRate] | <code>int</code> | <code>1000000</code> | Video bit rate in bits, defaults to 1 megabit (1000000) |

**Example**
```js
const cmu = new CordovaMediaUpload({
  imageWidth: 700,
  imageHeight: 700,
  videoWidth: 1920,
  videoHeight: 1080
});
```

<a name="CordovaMediaUpload+capturePhoto"></a>

### cordovaMediaUpload.capturePhoto([newOptionsObj]) ⇒ <code>promise</code>
Take a photo with the camera.

**Kind**: instance method of [<code>CordovaMediaUpload</code>](#CordovaMediaUpload)  
**Fulfil**: <code>string</code> - Local file URI for photo.  
**Reject**: <code>Error</code> - Rejected promise with message. No message if user cancelled.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newOptionsObj] | <code>object</code> | <code>{}</code> | New options to set or change. |

**Example**  
```js
cmu.capturePhoto()
  .then(fileUri => {})
  .catch(error => { if(error) console.log('error'); });
```
<a name="CordovaMediaUpload+getPhoto"></a>

### cordovaMediaUpload.getPhoto([newOptionsObj]) ⇒ <code>promise</code>
Get existing photo from library.

**Kind**: instance method of [<code>CordovaMediaUpload</code>](#CordovaMediaUpload)  
**Fulfil**: <code>string</code> - Local file URI for photo.  
**Reject**: <code>Error</code> - Rejected promise with message. No message if user cancelled.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newOptionsObj] | <code>object</code> | <code>{}</code> | New options to set or change. |

**Example**  
```js
cmu.getPhoto()
  .then(fileUri => {})
  .catch(error => { if(error) console.log('error'); });
```
<a name="CordovaMediaUpload+captureVideo"></a>

### cordovaMediaUpload.captureVideo([newOptionsObj]) ⇒ <code>promise</code>
Record video.

**Kind**: instance method of [<code>CordovaMediaUpload</code>](#CordovaMediaUpload)  
**Fulfil**: <code>array</code> [`string` imageUri, `string` videoUri] - The image and video file URI.  
**Reject**: <code>Error</code> - Rejected promise with message. No message if user cancelled.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newOptionsObj] | <code>object</code> | <code>{}</code> | New options to set or change. |

**Example**  
```js
cmu.captureVideo()
  .then([imageUri, videoUri] => {})
  .catch(error => { if(error) console.log('error'); });
```
<a name="CordovaMediaUpload+getVideo"></a>

### cordovaMediaUpload.getVideo([newOptionsObj]) ⇒ <code>promise</code>
Get existing video from library.

**Kind**: instance method of [<code>CordovaMediaUpload</code>](#CordovaMediaUpload)  
**Fulfil**: <code>array</code> [`string` imageUri, `string` videoUri] - The image and video file URI.  
**Reject**: <code>Error</code> - Rejected promise with message. No message if user cancelled.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [newOptionsObj] | <code>object</code> | <code>{}</code> | New options to set or change. |

**Example**  
```js
cmu.getVideo()
  .then([imageUri, videoUri] => {})
  .catch(error => { if(error) console.log('error'); });
```
<a name="CordovaMediaUpload+captureAudio"></a>

### cordovaMediaUpload.captureAudio() ⇒ <code>promise</code>
Record audio.

**Kind**: instance method of [<code>CordovaMediaUpload</code>](#CordovaMediaUpload)  
**Fulfil**: <code>string</code> - Local file URI for photo.  
**Reject**: <code>Error</code> - Rejected promise with message. No message if user cancelled.  
**Example**  
```js
cmu.captureAudio()
  .then(fileUri => {})
  .catch(error => { if(error) console.log('error'); });
```
<a name="CordovaMediaUpload+transcodeVideos"></a>

### cordovaMediaUpload.transcodeVideos(videoUris, [newOptionsObj]) ⇒ <code>promise</code>
Transcoode video.

**Kind**: instance method of [<code>CordovaMediaUpload</code>](#CordovaMediaUpload)  
**Fulfil**: <code>string[]</code> - Array of transcoded video URIs.  
**Reject**: <code>Error</code> - Rejected promise with message. No message if user cancelled.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| videoUris | <code>Array.&lt;string&gt;</code> \| <code>string</code> |  | Local video URIs to transcode. |
| [newOptionsObj] | <code>object</code> | <code>{}</code> | New options to set or change. |

**Example**  
```js
cmu.transcodeVideos()
  .then(videoUris => {})
  .catch(error => { if(error) console.log('error'); });
```
<a name="CordovaMediaUpload+uploadFiles"></a>

### cordovaMediaUpload.uploadFiles(serverUrl, paramsObj, fileUris, [videoUriArrObj]) ⇒ <code>promise</code>
Upload files.

**Kind**: instance method of [<code>CordovaMediaUpload</code>](#CordovaMediaUpload)  
**Fulfil**: <code>object[]</code> - JSON data from server.  
**Reject**: <code>Error</code> - Fail to convert files to blobs.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| serverUrl | <code>string</code> |  | URL to upload files to. |
| paramsObj | <code>object</code> |  | parameters to send to server. |
| fileUris | <code>Array.&lt;string&gt;</code> \| <code>string</code> |  | Local video URIs to upload. |
| [videoUriArrObj] | <code>object</code> | <code>{}</code> | The video and thumbnail URI array object |
| [videoUriArrObj.thumbs] | <code>Array.&lt;string&gt;</code> |  | The video thumbnail URIs |
| [videoUriArrObj.videos] | <code>Array.&lt;string&gt;</code> |  | The video URIs |

**Example**  
```js
const serverUrl = 'https://url-to-upload-files';
const paramsObj = {}; //Parameters sent to server
cmu.uploadFiles(serverUrl, paramsObj, fileUris)
  .then(data => {})
  .catch(error => { if(error) console.log('error'); });
```
<a name="CordovaMediaUpload+deleteFiles"></a>

### cordovaMediaUpload.deleteFiles(fileUris) ⇒ <code>promise</code>
Delete files.

**Kind**: instance method of [<code>CordovaMediaUpload</code>](#CordovaMediaUpload)  
**Fulfil**: - The file URI has been deleted.  
**Reject**: <code>Error</code> - Rejected promise with message.  

| Param | Type | Description |
| --- | --- | --- |
| fileUris | <code>Array.&lt;string&gt;</code> \| <code>string</code> | Local video URI to transcode. |

**Example**  
```js
cmu.deleteFiles(fileUris)
  .then(() => {})
  .catch(error => { if(error) console.log('error'); });
```