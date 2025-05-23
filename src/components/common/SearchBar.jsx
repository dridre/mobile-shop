import React from 'react';
import { Paper, InputBase, IconButton, Box, useTheme, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch } from 'react-redux';
import { setSearchTerm } from '../../redux/slices/productSlice';

const SearchBar = () => {
    const dispatch = useDispatch();

    // Estado local para el término de búsqueda
    const [localSearchTerm, setLocalSearchTerm] = React.useState('');

    // Configuración para diseño responsive
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Maneja los cambios en el input de búsqueda
    const handleSearch = (e) => {
        const value = e.target.value;

        // Actualiza el estado local
        setLocalSearchTerm(value);

        // Actualiza el estado global (Redux)
        dispatch(setSearchTerm(value));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-end',
                width: '100%',
                mt: 3,
                mb: 3
            }}
        >
            <Paper
                component="form"
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: isMobile ? '100%' : '50%',
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
        </Box>
    );
};

export default SearchBar;