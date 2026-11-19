interface KakaoLink {
  webUrl: string;
  mobileWebUrl: string;
}

interface Window {
  Kakao: {
    isInitialized(): boolean;
    init(key: string): void;
    Share: {
      sendDefault(options: {
        objectType: "feed";
        content: {
          title: string;
          description?: string;
          imageUrl: string;
          imageWidth?: number;
          imageHeight?: number;
          link: KakaoLink;
        };
        buttons?: { title: string; link: KakaoLink }[];
      }): void;
    };
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_KAKAO_JS_KEY?: string;
    TMDB_TOKEN?: string;
    TMDB_API_KEY?: string;
  }
}
