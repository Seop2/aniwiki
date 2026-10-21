import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim()); // 빈 값으로 검색하면 랭킹 목록으로 돌아간다
  };

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="작품 제목 검색 (예: 프리렌, 진격의 거인)"
        aria-label="작품 제목 검색"
      />
      <button type="submit" className="btn-primary corners">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        검색
      </button>
    </form>
  );
}
