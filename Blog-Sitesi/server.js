const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Bu, backend sunucusunun farklı portlardan gelen istekleri kabul etmesini sağlar.
const cors = require('cors');
app.use(cors());


// PostgreSQL bağlantısı
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tmdbveriler',
    password: 'i.nur0806',
    port: 5432,
});

// Film ekleme veya kontrol işlemi  veri tabanına ekleme işlemi bu kısımda yapılıyor.
app.post('/add-movie', async (req, res) => {
    const { tmdb_id, title, release_date, imdb_rating, overview } = req.body;

    console.log(req.body); // Burada gelen JSON verisini kontrol edebilirsiniz.


    try {
        // Veritabanında kontrol et
        const checkQuery = 'SELECT * FROM movies WHERE tmdb_id = $1';
        const checkResult = await pool.query(checkQuery, [tmdb_id]);

        if (checkResult.rows.length > 0) {
            return res.status(200).json({ message: 'Movie already exists in the database.' });
        }

        // Yeni film ekle
        const insertQuery = `
            INSERT INTO movies (tmdb_id, title, release_date, imdb_rating, overview)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(insertQuery, [tmdb_id, title, release_date, imdb_rating, overview]);

        res.status(201).json({ message: 'Movie added successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

const server = http.createServer((req, res) => {
    // URL'den dosya yolunu al
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './blogsitesi.html';
    }

    // Dosya uzantısını belirle
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    // Dosyayı oku ve gönder
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code === 'ENOENT') {
                // Dosya bulunamadı
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Sunucu hatası
                res.writeHead(500);
                res.end('Sunucu Hatası: ' + error.code);
            }
        } else {
            // Başarılı yanıt
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});


