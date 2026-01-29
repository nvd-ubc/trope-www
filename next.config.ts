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
		];
	},
};

export default nextConfig;
