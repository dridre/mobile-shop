import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    useMediaQuery,
    useTheme
} from '@mui/material';

const ProductDescription = ({ product }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {
        brand,
        model,
        price,
        cpu,
        ram,
        os,
        displaySize,
        battery,
        primaryCamera,
        secondaryCmera,
        dimentions,
        weight
    } = product;

    const specifications = [
        { name: 'Marca', value: brand },
        { name: 'Modelo', value: model },
        { name: 'Precio (€)', value: price || "--" },
        { name: 'CPU', value: cpu },
        { name: 'RAM', value: ram },
        { name: 'Sistema Operativo', value: os },
        { name: 'Resolución de pantalla', value: displaySize },
        { name: 'Batería', value: battery },
        { name: 'Cámara principal', value: Array.isArray(primaryCamera) ? primaryCamera.join(', ') : primaryCamera },
        { name: 'Cámara secundaria', value: secondaryCmera },
        { name: 'Dimensiones', value: dimentions },
        { name: 'Peso (g)', value: weight }
    ];

    return (
        <Box mb={2} >
            <Paper elevation={1} sx={{ mb: 2, mt: 4 }}>
                <Table
                    size="small"
                    sx={{
                        '& .MuiTableCell-root': {
                            padding: '3px 8px',
                            fontSize: '0.8rem',
                            lineHeight: '1.2'
                        },
                        '& .MuiTableRow-root': {
                            height: '32px'
                        }
                    }}
                >
                    <TableBody>
                        {specifications.map((spec) => (
                            spec.value && (
                                <TableRow key={spec.name}>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{
                                            fontWeight: 'bold',
                                            width: isMobile ? '45%' : '35%',
                                            borderBottom: '1px solid rgba(224, 224, 224, 0.3)',
                                            py: 0.5
                                        }}
                                    >
                                        {spec.name}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            borderBottom: '1px solid rgba(224, 224, 224, 0.3)',
                                            wordBreak: 'break-word',
                                            py: 0.5
                                        }}
                                    >
                                        {spec.value}
                                    </TableCell>
                                </TableRow>
                            )
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default ProductDescription;