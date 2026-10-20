const UPLOAD_SAMPLES = ['cat-01.jpg', 'cat-03.jpg', 'cat-05.jpg', 'cat-07.jpg', 'cat-10.jpg', 'cat-12.jpg', 'cat-13.jpg', 'cat-15.jpg', 'cat-16.jpg'];

function photoPickerModal() {
  const current = state.publish.photos[state.photoSlot];
  modal(`<h2>添加一张照片</h2><p class="modal-sub">从相册选择，或用相机拍一张。上传前会压缩到长边 1200px，减少流量；尽量拍清楚毛色和体型。</p><div class="photo-upload-box"><button class="btn btn-primary" type="button" data-action="upload-photo" data-target="publish" data-slot="${state.photoSlot}">${icon('camera')}从相册选择 / 拍照</button><span>JPEG / PNG / WebP · 压缩后存入，单张不超过 12MB</span></div><div class="photo-choices">${UPLOAD_SAMPLES.map((p) => `<button type="button" class="photo-choice ${current === p ? 'is-active' : ''}" data-pick-photo="${p}"><img src="${photoSrc(p)}" alt="候选猫照片" /></button>`).join('')}</div>${current ? `<div class="modal-actions"><button class="btn" type="button" data-action="clear-photo">移除当前照片</button><button class="btn btn-primary" type="button" data-close-modal>保留这张</button></div>` : ''}`);
}

function uploadKindModal(target, slot) {
  modal(`<h2>添加照片</h2><p class="modal-sub">选择照片用途。真实产品中这里会打开系统相册或相机。</p><label class="upload-picker"><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-input="${target}" data-slot="${slot}" /><span>${icon('camera')}从相册选择 / 拍照</span></label><p class="field-help">${icon('shield')}只上传你拍的照片；不要拍到陌生人正脸或具体门牌。</p><div class="modal-actions"><button class="btn" type="button" data-close-modal>取消</button></div>`); 
}
