# β·11.1 · Pulsarium source fix

Pulsarium now renders the active audio/video source inside the instrument before sampling it. The rhythmic engine no longer depends on a hidden Looperum/Videodrum media element to make the source perceptible.

- active file is shown with native controls;
- PLAY/ACOMPANYA and TALLA act on this visible source;
- sample extraction uses the selected File/Photo blob directly;
- if Safari cannot decode the container for sampling, the source remains visible and playable and the internal drum engine still works.
