import React, { useState } from 'react';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search...', loading = false }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="search-bar-input"
            />
            <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!query.trim()}
            >
                🔍 Search
            </Button>
        </form>
    );
};

export default SearchBar;
