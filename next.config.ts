import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/invite",
				headers: [
					{ key: "Cache-Control", value: "no-store" },
					{ key: "Pragma", value: "no-cache" },
					{ key: "Referrer-Policy", value: "no-referrer" },
					{ key: "X-Robots-Tag", value: "noindex" },
				],
			},
			{
				source: "/share/:path*",
				headers: [
					{ key: "Cache-Control", value: "no-store" },
					{ key: "Pragma", value: "no-cache" },
					{ key: "Referrer-Policy", value: "no-referrer" },
					{ key: "X-Robots-Tag", value: "noindex, nofollow" },
				],
			},
			{
				source: "/api/shares/:path*",
				headers: [
					{ key: "Cache-Control", value: "no-store" },
					{ key: "Pragma", value: "no-cache" },
					{ key: "Referrer-Policy", value: "no-referrer" },
					{ key: "X-Robots-Tag", value: "noindex, nofollow" },
				],
			},
		];
	},
	async redirects() {
		return [
			{
				source: "/customers",
				destination: "/use-cases",
				permanent: true,
			},
			{
				source: "/integrations",
				destination: "/resources",
				permanent: true,
			},
			{
				source: "/changelog",
				destination: "/release-notes",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
