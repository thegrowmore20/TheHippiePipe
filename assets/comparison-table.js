if (!customElements.get('comparison-table')) {
  customElements.define(
    'comparison-table',
    class ComparisonTable extends HTMLElement {
      connectedCallback() {
        this.scroller = this.querySelector('[ref="scroller"]');
        if (!this.scroller) return;

        this.controller = new AbortController();
        const { signal } = this.controller;

        this.scroller.addEventListener('pointerdown', this.onDown, { signal });
        this.scroller.addEventListener('dragstart', (e) => e.preventDefault(), { signal });
      }

      onDown = (event) => {
        if (event.pointerType === 'touch' || event.button !== 0) return;

        const startX = event.clientX;
        const startLeft = this.scroller.scrollLeft;
        let dragging = false;
        let frame = null;
        let latestX = startX;

        // Drag listeners live on their own controller so they are always torn down,
        // even if the element is removed mid-drag (section re-render in the editor).
        const dragController = new AbortController();
        this.dragController = dragController;
        const { signal } = dragController;

        const apply = () => {
          frame = null;
          this.scroller.scrollLeft = startLeft - (latestX - startX);
        };

        const onMove = (moveEvent) => {
          latestX = moveEvent.clientX;
          if (!dragging && Math.abs(latestX - startX) > 6) {
            dragging = true;
            this.scroller.classList.add('is-dragging');
          }
          // One scroll write per frame instead of one per pointermove.
          if (dragging && frame === null) frame = requestAnimationFrame(apply);
        };

        const onUp = () => {
          if (frame !== null) cancelAnimationFrame(frame);
          dragController.abort();
          this.dragController = null;
          this.scroller.classList.remove('is-dragging');
          if (dragging) {
            this.scroller.addEventListener(
              'click',
              (clickEvent) => {
                clickEvent.preventDefault();
                clickEvent.stopPropagation();
              },
              { capture: true, once: true }
            );
          }
        };

        window.addEventListener('pointermove', onMove, { signal });
        window.addEventListener('pointerup', onUp, { signal });
        window.addEventListener('pointercancel', onUp, { signal });
      };

      disconnectedCallback() {
        this.controller?.abort();
        this.dragController?.abort();
      }
    }
  );
}