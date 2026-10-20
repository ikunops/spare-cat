function photoPicker() {
  const choices = ['cat-01.jpg', 'cat-03.jpg', 'cat-05.jpg', 'cat-07.jpg', 'cat-10.jpg', 'cat-12.jpg', 'cat-13.jpg', 'cat-15.jpg', 'cat-16.jpg'];
  overlay(`
    <div class="sheet-handle"></div>
    <div class="sheet-scroll">
      <div class="sheet-head"><div><h2>选择一张照片</h2><p>原型环境用示例照片代替上传。真实产品会调用相机或相册。</p></div><button class="sheet-close" type="button" data-action="close-overlay" aria-label="关闭照片选择">${icon('close')}</button></div>
      <div class="photo-picker-grid">${choices.map((photo) => `<button class="photo-pick ${state.publish.photos.includes(photo) ? 'is-selected' : ''}" type="button" data-pick-photo="${photo}"><img src="${A}${photo}" alt="候选猫照片" /></button>`).join('')}</div>
    </div>`);
}
