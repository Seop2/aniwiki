// /discover에서 "본 작품"으로 고를 수 있는 유명작. 포스터 경로를 고정해 두어 그리드를 API 요청 없이 바로 그린다
export const SEEDS = [
  { id: 37854, title: '원피스', poster: '/qHjXsSUuolEtbgvYPzRjAuB1VHE.jpg' },
  { id: 46260, title: '나루토', poster: '/5llYnYzA2oiTxxSi9d7RSanrwR8.jpg' },
  { id: 30984, title: '블리치', poster: '/2cT8jkEVsAL86CVKALR4pnaVLDb.jpg' },
  { id: 1429, title: '진격의 거인', poster: '/kTYFXRdvo7GZWULKjeD4YZ929NC.jpg' },
  { id: 85937, title: '귀멸의 칼날', poster: '/iR6T6QxSJpSQi1S4GGjGWLQkSva.jpg' },
  { id: 95479, title: '주술회전', poster: '/pnn223i9v5kfYku6TbqdSbPePJp.jpg' },
  { id: 46298, title: '헌터x헌터', poster: '/8YKlXBit3PlVTXf9A1ohccCf9lQ.jpg' },
  { id: 31911, title: '강철의 연금술사 BROTHERHOOD', poster: '/9SkrxQDka8JAk8tUwb396prUR9J.jpg' },
  { id: 13916, title: '데스노트', poster: '/iigTJJskR1PcjjXqxdyJwVB3BoU.jpg' },
  { id: 60863, title: '하이큐!!', poster: '/uR1mpPoXFhAne2FZrkcEPrthORk.jpg' },
  { id: 114410, title: '체인소 맨', poster: '/eblIShqBgVPmRt86f4e02ouDNhE.jpg' },
  { id: 120089, title: '스파이 패밀리', poster: '/rikBBQHmCTOiZ7YoJVkYcKdXgNx.jpg' },
  { id: 105009, title: '도쿄 리벤저스', poster: '/qmFk2I6ov8kEVshSMyg1ZBEfvte.jpg' },
  { id: 65930, title: '나의 히어로 아카데미아', poster: '/wiXNjJaSSpnhPPa4N6APqpyVNBy.jpg' },
  { id: 63926, title: '원펀맨', poster: '/sV5D7lM4isMmK1gNSv2SglqYnni.jpg' },
  { id: 209867, title: '장송의 프리렌', poster: '/mnj30hYDVAbL9BOA0f4HrKubAGF.jpg' },
];

export const SEED_BY_ID = new Map(SEEDS.map((s) => [s.id, s]));

// 추천 결과에서 빼는 작품: 고를 수 있는 유명작 + 같은 시리즈의 다른 TMDB 항목
export const EXCLUDE_IDS = new Set([...SEED_BY_ID.keys(), 31910 /* 나루토 질풍전 */]);
