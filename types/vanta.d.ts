declare module "vanta/dist/vanta.net.min" {
  type VantaEffect = {
    destroy: () => void;
  };

  type VantaNetOptions = {
    el: HTMLElement;
    THREE: any;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    color?: number;
    backgroundColor?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
  };

  const NET: (options: VantaNetOptions) => VantaEffect;
  export default NET;
}
