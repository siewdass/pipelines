export let navigate: (path: string) => void;

export const setNavigate = (nav: (path: string) => void) => {
  navigate = nav;
};
