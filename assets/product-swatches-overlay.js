class ProductSwatches extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('data-overlay-on-media')) return;
    // Defer one frame: during morphSection hydration the card may not be fully
    // built yet, and moving nodes mid-morph breaks the morph walk.
    requestAnimationFrame(() => this.#place());
  }

  #place() {
    if (!this.isConnected) return;

    const gallery =
      this.closest('.product-card__content')?.querySelector('.card-gallery') ||
      this.closest('.product-card')?.querySelector('.card-gallery');

    if (gallery && !gallery.contains(this)) {
      gallery.appendChild(this);
    }
  }
}

if (!customElements.get('product-swatches')) {
  customElements.define('product-swatches', ProductSwatches);
}