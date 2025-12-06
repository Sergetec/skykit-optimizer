export type NavLink = {
  to: string;
  label: string;
};

export const primaryNavLinks: NavLink[] = [
  { to: '/inventory', label: 'Airport Inventory' },
  { to: '/network', label: 'Global Network' },
  { to: '/events', label: 'Events & Penalties' },
  { to: '/about', label: 'About Us' }
];

export default primaryNavLinks;
