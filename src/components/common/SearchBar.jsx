import React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch } from 'react-redux';
import { setSearchTerm } from '../../redux/slices/productSlice';

const SearchBar = () => {
    const dispatch = useDispatch();
    const [localSearchTerm, setLocalSearchTerm] = React.useState('');

    const handleSearch = (e) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
        dispatch(setSearchTerm(value));
    };

    return (
        <Paper
            component="form"
            sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                mb: 3
            }}
            elevation={2}
            onSubmit={(e) => e.preventDefault()}
        >
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Buscar por marca o modelo..."
                inputProps={{ 'aria-label': 'buscar productos' }}
                value={localSearchTerm}
                onChange={handleSearch}
            />
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
            </IconButton>
        </Paper>
    );
};

export default SearchBar;