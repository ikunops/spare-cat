function modal(html, cls = '') {
  const root = $('#webOverlay');
  root.innerHTML = `<div class="modal-layer"><div class="modal-backdrop" data-close-modal></div><div class="modal ${cls}"><button class="modal-close" type="button" data-close-modal aria-label="关闭">${icon('close')}</button>${html}</div></div>`;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  $('#webOverlay').innerHTML = '';
  document.body.style.overflow = '';
}

function simplePhotoPicker(title, current, action) {
  const target = action === 'compose' ? 'compose' : 'place';
  modal(`<h2>${esc(title)}</h2><p class="modal-sub">从相册选择，或用相机拍一张。上传前会压缩到长边 960px；只放公共环境，不拍具体门牌与陌生人正脸。</p><label class="upload-picker"><input type="file" accept="image/jpeg,image/png,image/webp" data-upload-input="${target}" data-slot="${state.photoSlot}" /><span>${icon('camera')}从相册选择 / 拍照</span></label><p class="field-help">想先体验，也可以用下面的示例图；示例图仅用于预览，正式内容请用真实照片。</p><div class="photo-choices">${UPLOAD_SAMPLES.map((p) => `<button type="button" class="photo-choice ${current === p ? 'is-active' : ''}" data-pick-simple-photo="${p}" data-photo-action="${action}"><img src="${photoSrc(p)}" alt="候选照片" /></button>`).join('')}</div><div class="modal-actions"><button class="btn" type="button" data-close-modal>取消</button>${current ? `<button class="btn" type="button" data-clear-simple-photo="${action}">移除</button>` : ''}</div>`);
}
