/** @type {import('next').NextConfig} */
// Konfiguracja Next.js.
// transpilePackages — biblioteka Spline jest publikowana w nowym formacie
// modułów; ta linijka każe Next.js przetworzyć ją tak, żeby build działał.
const nextConfig = {
  transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"],
};

export default nextConfig;
