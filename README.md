# Ular Tangga Rimba

Game ular tangga untuk 2–4 pemain, dibuat dengan [Phaser 3](https://phaser.io). Semua gambar (papan, ular, tangga, token, dadu, kotak hadiah) digambar lewat kode, dan musik serta efek suara disintesis langsung dengan WebAudio, jadi tidak ada file gambar atau audio.

Seluruh papan selalu terlihat. Kartu pemain 1–4 ada di empat sudut layar dan masing-masing punya dadu sendiri (ketuk dadumu untuk melempar). Di portrait, kartu pemain atas diputar menghadap pemain di seberang (bisa dimatikan di layar pengaturan). Di landscape, kartu ada di kiri dan kanan papan.

## Fitur

- 2–4 pemain, minimal 1 manusia dan 0–3 komputer.
- Token: 10 gambar bawaan (kuda, kucing, anjing, kelinci, ikan, ayam, bintang, hati, mahkota, roket) atau foto unggahan sendiri.
- Dadu beranimasi. Angka 6 memberi lemparan lagi, terus sampai bukan 6.
- Ular dan tangga bereaksi saat dilewati atau diinjak. Naik tangga dan turun lewat ular dianimasikan.
- Kamera zoom in ke bidak saat naik tangga atau digigit ular, lalu zoom out lagi ke papan utuh.
- Kotak hadiah memberi power-up: **Dobel Giliran**, **Anti-Ular**, **Anti-Tembak**.
- Mendarat tepat di kotak lawan menembaknya mundur 10 kotak.
- Lewat dari kotak 100 membuat bidak memantul balik. Harus tepat di 100 untuk menang.
- Musik latar dan efek suara, masing-masing bisa dimatikan.

## Menjalankan

Font dimuat dari folder `fonts/`, jadi jalankan lewat server lokal (jangan buka `index.html` langsung dari file):

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

## Struktur

```
index.html          markup halaman
css/style.css       tampilan, termasuk layout landscape
js/audio.js         musik dan efek suara (WebAudio)
js/art.js           gambar token dan kotak hadiah (canvas)
js/board.js         papan, ular, tangga, dadu, kamera, aturan permainan (Phaser)
js/ui.js            kartu pemain di sudut, layar pengaturan dan layar menang
vendor/phaser.min.js  Phaser 3.80.1
fonts/              Lilita One dan Nunito
```

## Tips pengembangan

Di konsol browser, `G.force=[6,6,3]` memaksa tiga lemparan dadu berikutnya, berguna untuk menguji aturan angka 6, ular, dan tangga.

## Rencana

- Multiplayer lewat internet (server menentukan lemparan dadu).
- Toko power-up dengan koin.
- Paket APK Android.

## Lisensi pihak ketiga

- Phaser 3.80.1, lisensi MIT.
- Lilita One dan Nunito, lisensi SIL Open Font License, dari paket Fontsource.
