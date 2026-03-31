let barang  = [];
let jasa    = [];
let riwayat = [];
let modalState  = { index: null, tipe: null };
let keranjang   = [];
let periodeAktif = 'hari';
let namaBengkel = 'Bengkel';

// ── Persistensi localStorage ─────────────────────────────────────────
function simpanData() {
  localStorage.setItem('bengkel_barang',  JSON.stringify(barang));
  localStorage.setItem('bengkel_jasa',    JSON.stringify(jasa));
  localStorage.setItem('bengkel_riwayat', JSON.stringify(riwayat));
  localStorage.setItem('bengkel_nama',    namaBengkel);
}

function muatData() {
  barang      = JSON.parse(localStorage.getItem('bengkel_barang')  || '[]');
  jasa        = JSON.parse(localStorage.getItem('bengkel_jasa')    || '[]');
  riwayat     = JSON.parse(localStorage.getItem('bengkel_riwayat') || '[]');
  namaBengkel = localStorage.getItem('bengkel_nama') || 'Bengkel';
}

// ── Setting Nama Bengkel ─────────────────────────────────────────────
function openSettingNama() {
  document.getElementById('inputNamaBengkel').value = namaBengkel;
  document.getElementById('modalSettingNama').classList.remove('hidden');
  document.getElementById('inputNamaBengkel').focus();
}
function closeSettingNama() { document.getElementById('modalSettingNama').classList.add('hidden'); }
function simpanNamaBengkel() {
  const val = document.getElementById('inputNamaBengkel').value.trim();
  if (!val) return;
  namaBengkel = val;
  document.getElementById('sidebarNamaBengkel').textContent = namaBengkel;
  simpanData();
  closeSettingNama();
}

// ── Hapus Riwayat ────────────────────────────────────────────────────
function hapusRiwayat(i) {
  document.getElementById('hapusRiwayatJudul').textContent = 'Hapus Transaksi?';
  document.getElementById('hapusRiwayatSub').textContent   = `"${riwayat[i].nama}" — ${riwayat[i].waktu}`;
  document.getElementById('hapusRiwayatIndex').value = i;
  document.getElementById('modalHapusRiwayat').classList.remove('hidden');
}
function hapusSemuaRiwayat() {
  document.getElementById('hapusRiwayatJudul').textContent = 'Hapus Semua Riwayat?';
  document.getElementById('hapusRiwayatSub').textContent   = 'Semua data transaksi akan dihapus permanen.';
  document.getElementById('hapusRiwayatIndex').value = -1;
  document.getElementById('modalHapusRiwayat').classList.remove('hidden');
}
function closeHapusRiwayat() { document.getElementById('modalHapusRiwayat').classList.add('hidden'); }
function konfirmasiHapusRiwayat() {
  const i = parseInt(document.getElementById('hapusRiwayatIndex').value);
  if (i === -1) riwayat = [];
  else riwayat.splice(i, 1);
  closeHapusRiwayat();
  render();
}

// ── Tambah Barang ───────────────────────────────────────────────────
function toggleKetLainnya() {
  const val  = document.getElementById('kategoriMasuk').value;
  document.getElementById('ketLainnyaWrap').classList.toggle('hidden', val !== 'Lainnya');
}

function tambahBarang() {
  const nama      = document.getElementById('nama').value.trim();
  const stokAwal  = parseInt(document.getElementById('stokAwal').value) || 0;
  const hargaBeli = parseInt(document.getElementById('hargaBeli').value);
  const hargaJual = parseInt(document.getElementById('hargaJual').value);
  const kategori  = document.getElementById('kategoriMasuk').value;
  const ketManual = document.getElementById('ketLainnya').value.trim();
  const keterangan = kategori === 'Lainnya' ? (ketManual || 'Lainnya') : kategori;

  if (!nama)                             { alert('Nama barang wajib diisi!'); return; }
  if (isNaN(hargaBeli) || hargaBeli < 0) { alert('Harga beli wajib diisi!'); return; }
  if (isNaN(hargaJual) || hargaJual < 0) { alert('Harga jual wajib diisi!'); return; }
  if (barang.some(b => b.nama.toLowerCase() === nama.toLowerCase())) {
    alert(`Barang "${nama}" sudah ada!`); return;
  }

  barang.push({ nama, stok: stokAwal, hargaBeli, hargaJual });
  if (stokAwal > 0) {
    riwayat.unshift({ waktu: now(), nama, tipe: 'masuk', jumlah: stokAwal,
      hargaSatuan: hargaBeli, totalHarga: stokAwal * hargaBeli, keterangan });
  }
  ['nama','stokAwal','hargaBeli','hargaJual','ketLainnya'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('kategoriMasuk').value = 'Stok awal';
  document.getElementById('ketLainnyaWrap').classList.add('hidden');
  render();
}

// ── Hapus Barang ────────────────────────────────────────────────────
function hapusBarang(i) { openKonfirmHapus(i); }

function openKonfirmHapus(i) {
  document.getElementById('hapusNama').textContent = barang[i].nama;
  document.getElementById('hapusIndex').value = i;
  document.getElementById('modalHapus').classList.remove('hidden');
}
function closeHapus() { document.getElementById('modalHapus').classList.add('hidden'); }
function konfirmasiHapus() {
  barang.splice(parseInt(document.getElementById('hapusIndex').value), 1);
  closeHapus(); render();
}

// ── Edit Barang ─────────────────────────────────────────────────────
function openEdit(i) {
  const item = barang[i];
  document.getElementById('editIndex').value     = i;
  document.getElementById('editNama').value      = item.nama;
  document.getElementById('editStok').value      = item.stok;
  document.getElementById('editHargaBeli').value = item.hargaBeli;
  document.getElementById('editHargaJual').value = item.hargaJual;
  document.getElementById('modalEdit').classList.remove('hidden');
  document.getElementById('editNama').focus();
}
function closeEdit() { document.getElementById('modalEdit').classList.add('hidden'); }
function simpanEdit() {
  const i         = parseInt(document.getElementById('editIndex').value);
  const nama      = document.getElementById('editNama').value.trim();
  const stok      = parseInt(document.getElementById('editStok').value);
  const hargaBeli = parseInt(document.getElementById('editHargaBeli').value);
  const hargaJual = parseInt(document.getElementById('editHargaJual').value);

  if (!nama)                             { alert('Nama tidak boleh kosong!'); return; }
  if (isNaN(stok)      || stok      < 0) { alert('Jumlah stok tidak valid!'); return; }
  if (isNaN(hargaBeli) || hargaBeli < 0) { alert('Harga beli tidak valid!');  return; }
  if (isNaN(hargaJual) || hargaJual < 0) { alert('Harga jual tidak valid!');  return; }
  if (barang.some((b, idx) => idx !== i && b.nama.toLowerCase() === nama.toLowerCase())) {
    alert(`Barang "${nama}" sudah ada!`); return;
  }
  const namaLama = barang[i].nama;
  barang[i] = { ...barang[i], nama, stok, hargaBeli, hargaJual };
  if (namaLama !== nama) riwayat.forEach(r => { if (r.nama === namaLama) r.nama = nama; });
  closeEdit(); render();
}

// ── Kelola Jasa ─────────────────────────────────────────────────────
function tambahJasa() {
  const nama  = document.getElementById('jasaNama').value.trim();
  const tarif = parseInt(document.getElementById('jasaTarif').value);

  if (!nama)                   { alert('Nama jasa wajib diisi!'); return; }
  if (isNaN(tarif) || tarif < 0) { alert('Tarif tidak valid!'); return; }
  if (jasa.some(j => j.nama.toLowerCase() === nama.toLowerCase())) {
    alert(`Jasa "${nama}" sudah ada!`); return;
  }
  jasa.push({ nama, tarif });
  document.getElementById('jasaNama').value  = '';
  document.getElementById('jasaTarif').value = '';
  render();
}

function openEditJasa(i) {
  document.getElementById('editJasaIndex').value = i;
  document.getElementById('editJasaNama').value  = jasa[i].nama;
  document.getElementById('editJasaTarif').value = jasa[i].tarif;
  document.getElementById('modalEditJasa').classList.remove('hidden');
  document.getElementById('editJasaNama').focus();
}
function closeEditJasa() { document.getElementById('modalEditJasa').classList.add('hidden'); }
function simpanEditJasa() {
  const i     = parseInt(document.getElementById('editJasaIndex').value);
  const nama  = document.getElementById('editJasaNama').value.trim();
  const tarif = parseInt(document.getElementById('editJasaTarif').value);

  if (!nama)                   { alert('Nama tidak boleh kosong!'); return; }
  if (isNaN(tarif) || tarif < 0) { alert('Tarif tidak valid!'); return; }
  if (jasa.some((j, idx) => idx !== i && j.nama.toLowerCase() === nama.toLowerCase())) {
    alert(`Jasa "${nama}" sudah ada!`); return;
  }
  jasa[i] = { nama, tarif };
  closeEditJasa(); render();
}

function hapusJasa(i) {
  jasa.splice(i, 1); render();
}

// ── Modal Transaksi (masuk/keluar satuan) ───────────────────────────
function openModal(i, tipe) {
  modalState = { index: i, tipe };
  const item    = barang[i];
  const isMasuk = tipe === 'masuk';
  document.getElementById('modalTitle').textContent      = isMasuk ? '📥 Pemasukan Barang' : '📤 Pengeluaran Barang';
  document.getElementById('modalSubtitle').textContent   = `${item.nama} — stok: ${item.stok} unit`;
  document.getElementById('modalHargaLabel').textContent = isMasuk ? 'Harga Beli Satuan' : 'Harga Jual Satuan';
  document.getElementById('modalJumlah').value           = '';
  document.getElementById('modalHarga').value            = isMasuk ? item.hargaBeli : item.hargaJual;
  document.getElementById('modalKeterangan').value       = '';
  document.getElementById('modalTotal').textContent      = 'Rp 0';
  const btn = document.getElementById('modalConfirm');
  btn.className   = 'flex-1 py-3 rounded-xl font-semibold transition cursor-pointer ' +
    (isMasuk ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-red-500 hover:bg-red-400 text-white');
  btn.textContent = isMasuk ? 'Catat Masuk' : 'Catat Keluar';
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modalJumlah').focus();
}
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  modalState = { index: null, tipe: null };
}
function hitungModalTotal() {
  const j = parseInt(document.getElementById('modalJumlah').value) || 0;
  const h = parseInt(document.getElementById('modalHarga').value)  || 0;
  document.getElementById('modalTotal').textContent = 'Rp ' + (j * h).toLocaleString('id-ID');
}
function konfirmasiTransaksi() {
  const jumlah = parseInt(document.getElementById('modalJumlah').value);
  const harga  = parseInt(document.getElementById('modalHarga').value);
  const ket    = document.getElementById('modalKeterangan').value.trim();
  const { index, tipe } = modalState;

  if (isNaN(jumlah) || jumlah <= 0) { document.getElementById('modalJumlah').focus(); return; }
  if (isNaN(harga)  || harga  <  0) { document.getElementById('modalHarga').focus();  return; }

  const item = barang[index];
  if (tipe === 'keluar' && jumlah > item.stok) {
    alert(`Stok tidak cukup! Tersedia: ${item.stok}`); return;
  }
  if (tipe === 'masuk') {
    const totalNilaiLama = item.stok * item.hargaBeli;
    const totalNilaiBaru = jumlah * harga;
    item.stok     += jumlah;
    item.hargaBeli = Math.round((totalNilaiLama + totalNilaiBaru) / item.stok);
  }
  else                  { item.stok -= jumlah; item.hargaJual = harga; }

  riwayat.unshift({ waktu: now(), nama: item.nama, tipe, jumlah,
    hargaSatuan: harga, totalHarga: jumlah * harga, keterangan: ket || '-' });
  closeModal(); render();
}

// ── Kasir ────────────────────────────────────────────────────────────
function tambahKeranjang(tipe, i) {
  const sumber = tipe === 'barang' ? barang[i] : jasa[i];
  const harga  = tipe === 'barang' ? sumber.hargaJual : sumber.tarif;
  const ada    = keranjang.find(k => k.tipe === tipe && k.index === i);

  if (ada) {
    if (tipe === 'barang' && ada.qty >= sumber.stok) { alert('Stok tidak cukup!'); return; }
    ada.qty++;
  } else {
    keranjang.push({ tipe, index: i, nama: sumber.nama, harga, qty: 1 });
  }
  renderKeranjang();
}

function ubahQtyKeranjang(i, delta) {
  const k = keranjang[i];
  k.qty += delta;
  if (k.qty <= 0) keranjang.splice(i, 1);
  else if (k.tipe === 'barang') {
    const stok = barang[k.index]?.stok ?? 0;
    if (k.qty > stok) k.qty = stok;
  }
  renderKeranjang();
}

function keranjangKosong() { keranjang = []; renderKeranjang(); }

function renderKasirPilih() {
  const cari  = (document.getElementById('kasirCari')?.value || '').toLowerCase();
  const list  = document.getElementById('kasirListBarang');
  const empty = document.getElementById('kasirEmpty');
  if (!list) return;

  const filtered = barang.map((b, i) => ({ ...b, i })).filter(b => b.stok > 0 && b.nama.toLowerCase().includes(cari));
  empty.classList.toggle('hidden', filtered.length > 0);
  list.innerHTML = filtered.map(b => `
    <div class="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition cursor-pointer"
         onclick="tambahKeranjang('barang',${b.i})">
      <div>
        <p class="text-white text-sm font-medium">${b.nama}</p>
        <p class="text-white/40 text-xs">Stok: ${b.stok} • Rp ${b.hargaJual.toLocaleString('id-ID')}</p>
      </div>
      <span class="text-emerald-300 text-lg font-bold">+</span>
    </div>`).join('');

  // Render jasa di kasir
  const listJasa  = document.getElementById('kasirListJasa');
  const emptyJasa = document.getElementById('kasirEmptyJasa');
  if (!listJasa) return;
  emptyJasa.style.display = jasa.length ? 'none' : 'block';
  listJasa.innerHTML = jasa.map((j, i) => `
    <div class="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition cursor-pointer"
         onclick="tambahKeranjang('jasa',${i})">
      <div>
        <p class="text-white text-sm font-medium">${j.nama}</p>
        <p class="text-white/40 text-xs">Rp ${j.tarif.toLocaleString('id-ID')}</p>
      </div>
      <span class="text-orange-300 text-lg font-bold">+</span>
    </div>`).join('');
}

function renderKeranjang() {
  const wrap  = document.getElementById('kasirKeranjang');
  const empty = document.getElementById('kasirKeranjangEmpty');
  if (!wrap) return;

  const subtotalBarang = keranjang.filter(k => k.tipe === 'barang').reduce((s, k) => s + k.harga * k.qty, 0);
  const subtotalJasa   = keranjang.filter(k => k.tipe === 'jasa').reduce((s, k) => s + k.harga * k.qty, 0);
  const total          = subtotalBarang + subtotalJasa;

  empty.style.display = keranjang.length ? 'none' : 'block';
  document.getElementById('kasirTotal').textContent           = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('kasirSubtotalBarang').textContent  = 'Rp ' + subtotalBarang.toLocaleString('id-ID');
  document.getElementById('kasirSubtotalJasa').textContent    = 'Rp ' + subtotalJasa.toLocaleString('id-ID');

  wrap.innerHTML = keranjang.map((k, i) => `
    <div class="flex items-center gap-3 px-4 py-3">
      <div class="flex-1 min-w-0">
        <p class="text-white text-sm font-medium truncate">${k.nama}</p>
        <p class="text-white/40 text-xs">${k.tipe === 'jasa' ? '⚙️ Jasa' : '📦 Sparepart'} • Rp ${k.harga.toLocaleString('id-ID')}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="ubahQtyKeranjang(${i},-1)" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center cursor-pointer">−</button>
        <span class="text-white font-bold w-6 text-center text-sm">${k.qty}</span>
        <button onclick="ubahQtyKeranjang(${i},1)"  class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center cursor-pointer">+</button>
      </div>
      <span class="text-emerald-300 text-xs font-semibold w-20 text-right">Rp ${(k.harga*k.qty).toLocaleString('id-ID')}</span>
    </div>`).join('');
}

function prosesTransaksi() {
  if (keranjang.length === 0) { alert('Keranjang masih kosong!'); return; }

  for (const k of keranjang.filter(k => k.tipe === 'barang')) {
    const item = barang[k.index];
    if (!item || k.qty > item.stok) {
      alert(`Stok "${k.nama}" tidak cukup! Tersedia: ${item?.stok ?? 0}`); return;
    }
  }

  const pelanggan = document.getElementById('kasirPelanggan').value.trim() || 'Umum';
  const noNota    = 'TRX-' + Date.now().toString().slice(-6);
  const waktu     = now();
  const snapshot  = keranjang.map(k => ({ ...k }));

  keranjang.forEach(k => {
    if (k.tipe === 'barang') {
      const item = barang[k.index];
      item.stok -= k.qty; item.hargaJual = k.harga;
      riwayat.unshift({ waktu, nama: k.nama, tipe: 'keluar', jumlah: k.qty,
        hargaSatuan: k.harga, totalHarga: k.qty * k.harga,
        keterangan: `Transaksi ${noNota} - ${pelanggan}` });
    } else {
      riwayat.unshift({ waktu, nama: k.nama, tipe: 'jasa', jumlah: k.qty,
        hargaSatuan: k.harga, totalHarga: k.qty * k.harga,
        keterangan: `Transaksi ${noNota} - ${pelanggan}` });
    }
  });

  tampilNota({ noNota, waktu, pelanggan, items: snapshot });
  keranjang = [];
  document.getElementById('kasirPelanggan').value = '';
  render();
}

// ── Nota ─────────────────────────────────────────────────────────────
function tampilNota({ noNota, waktu, pelanggan, items }) {
  const itemsBarang = items.filter(k => k.tipe === 'barang');
  const itemsJasa   = items.filter(k => k.tipe === 'jasa');
  const subBarang   = itemsBarang.reduce((s, k) => s + k.harga * k.qty, 0);
  const subJasa     = itemsJasa.reduce((s, k) => s + k.harga * k.qty, 0);
  const total       = subBarang + subJasa;

  document.getElementById('notaNamaBengkel').textContent = namaBengkel;
  document.getElementById('notaNo').textContent        = noNota;
  document.getElementById('notaWaktu').textContent     = waktu;
  document.getElementById('notaPelanggan').textContent = pelanggan;
  document.getElementById('notaTotal').textContent     = 'Rp ' + total.toLocaleString('id-ID');
  document.getElementById('notaSubtotalBarang').textContent = 'Rp ' + subBarang.toLocaleString('id-ID');
  document.getElementById('notaSubtotalJasa').textContent   = 'Rp ' + subJasa.toLocaleString('id-ID');

  document.getElementById('notaSparepartSection').style.display = itemsBarang.length ? '' : 'none';
  document.getElementById('notaJasaSection').style.display      = itemsJasa.length   ? '' : 'none';

  document.getElementById('notaItemsBarang').innerHTML = itemsBarang.map(k => `
    <tr>
      <td class="py-1 pr-2">${k.nama}</td>
      <td class="py-1 text-center">${k.qty}</td>
      <td class="py-1 text-right">Rp ${k.harga.toLocaleString('id-ID')}</td>
      <td class="py-1 text-right font-semibold">Rp ${(k.harga*k.qty).toLocaleString('id-ID')}</td>
    </tr>`).join('');

  document.getElementById('notaItemsJasa').innerHTML = itemsJasa.map(k => `
    <tr>
      <td class="py-1 pr-2">${k.nama}${k.qty > 1 ? ` (x${k.qty})` : ''}</td>
      <td class="py-1 text-right font-semibold">Rp ${(k.harga*k.qty).toLocaleString('id-ID')}</td>
    </tr>`).join('');

  document.getElementById('modalNota').classList.remove('hidden');
}

function closeNota() { document.getElementById('modalNota').classList.add('hidden'); }

function cetakNota() {
  const area = document.getElementById('printArea');
  area.innerHTML = document.getElementById('notaContent').innerHTML;
  // Beri waktu browser render dulu sebelum print
  setTimeout(() => window.print(), 100);
}

// ── Sidebar toggle ────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const isOpen  = !sidebar.classList.contains('-translate-x-full');
  sidebar.classList.toggle('-translate-x-full', isOpen);
  overlay.classList.toggle('hidden', isOpen);
}

// ── Tab ──────────────────────────────────────────────────────────────
const tabMeta = {
  dashboard: { title: 'Dashboard',      sub: 'Ringkasan aktivitas bengkel' },
  stok:      { title: 'Stok Barang',    sub: 'Kelola inventaris sparepart' },
  jasa:      { title: 'Kelola Jasa',    sub: 'Daftar jasa & tarif bengkel' },
  kasir:     { title: 'Kasir',          sub: 'Proses transaksi pelanggan' },
  keluar:    { title: 'Barang Keluar',  sub: 'Rekap pengeluaran barang' },
  riwayat:   { title: 'Riwayat',        sub: 'Semua transaksi masuk & keluar' },
  laporan:   { title: 'Laporan',        sub: 'Rekap & analisis keuangan bengkel' },
};

function switchTab(tab) {
  const tabs = ['dashboard', 'stok', 'jasa', 'kasir', 'keluar', 'riwayat', 'laporan'];

  tabs.forEach(t => {
    document.getElementById('panel' + t.charAt(0).toUpperCase() + t.slice(1))
      .classList.toggle('hidden', t !== tab);
  });

  document.getElementById('formBarang').classList.toggle('hidden', tab !== 'stok');
  document.getElementById('summaryCards').classList.toggle('hidden', tab !== 'stok');

  tabs.forEach(t => {
    document.getElementById('nav' + t.charAt(0).toUpperCase() + t.slice(1)).className =
      'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer text-left ' +
      (t === tab ? 'bg-white text-purple-700 shadow-lg' : 'text-white/70 hover:bg-white/10');
  });

  document.getElementById('pageTitle').textContent    = tabMeta[tab].title;
  document.getElementById('pageSubtitle').textContent = tabMeta[tab].sub;

  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebarOverlay').classList.add('hidden');

  if (tab === 'kasir')     renderKasirPilih();
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'laporan')   renderLaporan();
}

// ── Render ────────────────────────────────────────────────────────────
function render() {
  simpanData();
  renderTable();
  renderJasa();
  renderKeluar();
  renderRiwayat();
  renderSummary();
  renderKasirPilih();
  renderKeranjang();
  renderDashboard();
  renderLaporan();
  renderNotifStok();
  document.getElementById('sidebarNamaBengkel').textContent = namaBengkel;
}

// ── Dashboard ─────────────────────────────────────────────────────────
function renderDashboard() {
  if (document.getElementById('panelDashboard').classList.contains('hidden')) return;

  const masukList  = riwayat.filter(r => r.tipe === 'masuk');
  const keluarList = riwayat.filter(r => r.tipe === 'keluar');
  const nilaiMasuk  = masukList.reduce((s,r)=>s+r.totalHarga,0);
  const nilaiKeluar = keluarList.reduce((s,r)=>s+r.totalHarga,0);
  const uMasuk  = masukList.reduce((s,r)=>s+r.jumlah,0);
  const uKeluar = keluarList.reduce((s,r)=>s+r.jumlah,0);

  document.getElementById('dbTotalBarang').textContent = barang.length;
  document.getElementById('dbTotalStok').textContent   = barang.reduce((s,b)=>s+b.stok,0);
  document.getElementById('dbNilaiMasuk').textContent  = 'Rp ' + nilaiMasuk.toLocaleString('id-ID');
  document.getElementById('dbNilaiKeluar').textContent = 'Rp ' + nilaiKeluar.toLocaleString('id-ID');
  document.getElementById('dbUnitMasuk').textContent   = uMasuk + ' unit';
  document.getElementById('dbUnitKeluar').textContent  = uKeluar + ' unit';

  // ── Chart 7 hari ──
  const chart = document.getElementById('dbChart');
  const days  = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit' }));
  }
  const maxVal = Math.max(1, ...days.map(day => {
    const m = masukList.filter(r=>r.waktu.startsWith(day)).reduce((s,r)=>s+r.totalHarga,0);
    const k = keluarList.filter(r=>r.waktu.startsWith(day)).reduce((s,r)=>s+r.totalHarga,0);
    return Math.max(m, k);
  }));
  chart.innerHTML = days.map(day => {
    const m = masukList.filter(r=>r.waktu.startsWith(day)).reduce((s,r)=>s+r.totalHarga,0);
    const k = keluarList.filter(r=>r.waktu.startsWith(day)).reduce((s,r)=>s+r.totalHarga,0);
    const hm = Math.max(4, Math.round((m/maxVal)*130));
    const hk = Math.max(4, Math.round((k/maxVal)*130));
    return `<div class="flex-1 flex flex-col items-center gap-1">
      <div class="w-full flex items-end gap-0.5 justify-center" style="height:130px">
        <div class="w-1/2 rounded-t-lg bg-emerald-400/70 hover:bg-emerald-400 transition" style="height:${hm}px" title="Masuk: Rp ${m.toLocaleString('id-ID')}"></div>
        <div class="w-1/2 rounded-t-lg bg-red-400/70 hover:bg-red-400 transition" style="height:${hk}px" title="Keluar: Rp ${k.toLocaleString('id-ID')}"></div>
      </div>
      <p class="text-white/40 text-xs">${day}</p>
    </div>`;
  }).join('');

  // ── Jasa list ──
  const jEl = document.getElementById('dbJasaList');
  const jEm = document.getElementById('dbJasaEmpty');
  jEm.style.display = jasa.length ? 'none' : 'block';
  jEl.innerHTML = jasa.map(j => `
    <div class="flex justify-between items-center bg-white/5 rounded-xl px-3 py-2">
      <span class="text-white text-sm">⚙️ ${j.nama}</span>
      <span class="text-orange-300 text-xs font-semibold">Rp ${j.tarif.toLocaleString('id-ID')}</span>
    </div>`).join('');

  // ── Stok kritis ──
  const kritis = barang.filter(b => b.stok <= 3).sort((a,b)=>a.stok-b.stok);
  document.getElementById('dbStokKritis').innerHTML = kritis.map(b => `
    <div class="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
      <span class="text-white text-sm">${b.nama}</span>
      <span class="px-2 py-0.5 rounded-full text-xs font-bold ${b.stok===0?'bg-red-500/40 text-red-300':'bg-yellow-500/30 text-yellow-300'}">${b.stok===0?'Habis':b.stok+' unit'}</span>
    </div>`).join('');
  document.getElementById('dbStokKritisEmpty').style.display = kritis.length ? 'none' : 'block';

  // ── Transaksi terakhir ──
  const last5 = riwayat.slice(0, 5);
  document.getElementById('dbRiwayatTerakhir').innerHTML = last5.map(r => {
    const warna = r.tipe==='masuk'?'text-emerald-300':r.tipe==='jasa'?'text-orange-300':'text-red-300';
    const icon  = r.tipe==='masuk'?'📥':r.tipe==='jasa'?'⚙️':'📤';
    return `<div class="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
      <div class="flex items-center gap-2 min-w-0">
        <span>${icon}</span>
        <div class="min-w-0">
          <p class="text-white text-xs font-medium truncate">${r.nama}</p>
          <p class="text-white/30 text-xs">${r.waktu}</p>
        </div>
      </div>
      <span class="${warna} text-xs font-semibold whitespace-nowrap ml-2">Rp ${r.totalHarga.toLocaleString('id-ID')}</span>
    </div>`;
  }).join('');
  document.getElementById('dbRiwayatEmpty').style.display = last5.length ? 'none' : 'block';

  // ── Top barang terlaris ──
  const topMap = {};
  keluarList.forEach(r => {
    topMap[r.nama] = (topMap[r.nama]||0) + r.jumlah;
  });
  const topList = Object.entries(topMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxUnit = topList[0]?.[1] || 1;
  document.getElementById('dbTopBarang').innerHTML = topList.map(([nama, unit], i) => `
    <div class="flex items-center gap-3">
      <span class="text-white/40 text-xs w-4">${i+1}</span>
      <div class="flex-1">
        <div class="flex justify-between mb-1">
          <span class="text-white text-xs font-medium">${nama}</span>
          <span class="text-white/50 text-xs">${unit} unit</span>
        </div>
        <div class="h-2 bg-white/10 rounded-full overflow-hidden">
          <div class="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-400 transition-all"
               style="width:${Math.round((unit/maxUnit)*100)}%"></div>
        </div>
      </div>
    </div>`).join('');
  document.getElementById('dbTopBarangEmpty').style.display = topList.length ? 'none' : 'block';
}

function renderTable() {
  const tbody  = document.getElementById('listBarang');
  const mobile = document.getElementById('listBarangMobile');
  const empty  = document.getElementById('emptyState');
  empty.style.display = barang.length ? 'none' : 'block';

  // Desktop tabel rows
  tbody.innerHTML = barang.map((item, i) => `
    <tr class="hover:bg-white/10 transition">
      <td class="px-4 py-3 font-medium">${item.nama}</td>
      <td class="px-4 py-3 text-center">
        <span class="px-3 py-1 rounded-full text-xs font-bold ${item.stok===0?'bg-red-500/30 text-red-300':item.stok<=3?'bg-yellow-500/30 text-yellow-300':'bg-white/20 text-white'}">${item.stok}</span>
      </td>
      <td class="px-4 py-3 text-right text-blue-300">Rp ${item.hargaBeli.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right text-emerald-300">Rp ${item.hargaJual.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right text-white/70">Rp ${(item.stok*item.hargaBeli).toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-center">
        <div class="flex gap-2 justify-center">
          <button data-action="masuk" data-index="${i}" class="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer">+ Masuk</button>
          <button data-action="keluar" data-index="${i}" class="bg-red-500/30 hover:bg-red-500/50 text-red-300 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer">− Keluar</button>
        </div>
      </td>
      <td class="px-4 py-3 text-center">
        <div class="flex gap-2 justify-center">
          <button data-action="edit" data-index="${i}" class="text-blue-300 hover:bg-blue-500/20 px-3 py-1 rounded-lg text-xs transition cursor-pointer">Ubah</button>
          <button data-action="hapus" data-index="${i}" class="text-white/30 hover:text-red-300 hover:bg-red-500/20 px-3 py-1 rounded-lg text-xs transition cursor-pointer">Hapus</button>
        </div>
      </td>
    </tr>`).join('');

  // Mobile card rows
  mobile.innerHTML = barang.map((item, i) => `
    <div class="p-4 space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-white font-semibold">${item.nama}</p>
        <span class="px-3 py-1 rounded-full text-xs font-bold ${item.stok===0?'bg-red-500/30 text-red-300':item.stok<=3?'bg-yellow-500/30 text-yellow-300':'bg-white/20 text-white'}">${item.stok} unit</span>
      </div>
      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="bg-white/5 rounded-xl p-2 text-center">
          <p class="text-white/60 mb-1">Harga Beli</p>
          <p class="text-blue-300 font-semibold">Rp ${item.hargaBeli.toLocaleString('id-ID')}</p>
        </div>
        <div class="bg-white/5 rounded-xl p-2 text-center">
          <p class="text-white/60 mb-1">Harga Jual</p>
          <p class="text-emerald-300 font-semibold">Rp ${item.hargaJual.toLocaleString('id-ID')}</p>
        </div>
        <div class="bg-white/5 rounded-xl p-2 text-center">
          <p class="text-white/60 mb-1">Nilai Stok</p>
          <p class="text-white/80 font-semibold">Rp ${(item.stok*item.hargaBeli).toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button data-action="masuk" data-index="${i}" class="flex-1 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 py-2 rounded-xl text-xs font-semibold transition cursor-pointer">+ Masuk</button>
        <button data-action="keluar" data-index="${i}" class="flex-1 bg-red-500/30 hover:bg-red-500/50 text-red-300 py-2 rounded-xl text-xs font-semibold transition cursor-pointer">− Keluar</button>
        <button data-action="edit" data-index="${i}" class="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-xl text-xs transition cursor-pointer">Ubah</button>
        <button data-action="hapus" data-index="${i}" class="bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-300 px-3 py-2 rounded-xl text-xs transition cursor-pointer">🗑️</button>
      </div>
    </div>`).join('');
}

function renderJasa() {
  const tbody = document.getElementById('listJasa');
  document.getElementById('emptyJasa').style.display = jasa.length ? 'none' : 'block';
  tbody.innerHTML = jasa.map((j, i) => `
    <tr class="hover:bg-white/10 transition">
      <td class="px-4 py-3 font-medium">${j.nama}</td>
      <td class="px-4 py-3 text-right text-orange-300 font-semibold">Rp ${j.tarif.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-center">
        <div class="flex gap-2 justify-center">
          <button data-action="editJasa" data-index="${i}" class="text-blue-300 hover:bg-blue-500/20 px-3 py-1 rounded-lg text-xs transition cursor-pointer">Ubah</button>
          <button data-action="hapusJasa" data-index="${i}" class="text-white/30 hover:text-red-300 hover:bg-red-500/20 px-3 py-1 rounded-lg text-xs transition cursor-pointer">Hapus</button>
        </div>
      </td>
    </tr>`).join('');
}

function renderKeluar() {
  const tbody = document.getElementById('listKeluar');
  const keluarMap = {};
  riwayat.filter(r => r.tipe === 'keluar').forEach(r => {
    if (!keluarMap[r.nama]) keluarMap[r.nama] = { unit: 0, nilai: 0, hargaJual: 0 };
    keluarMap[r.nama].unit  += r.jumlah;
    keluarMap[r.nama].nilai += r.totalHarga;
    keluarMap[r.nama].hargaJual = r.hargaSatuan;
  });
  const entries = Object.entries(keluarMap);
  document.getElementById('emptyKeluar').style.display = entries.length ? 'none' : 'block';
  document.getElementById('grandTotalKeluar').textContent = 'Rp ' + entries.reduce((s,[,v])=>s+v.nilai,0).toLocaleString('id-ID');
  tbody.innerHTML = entries.map(([nama, data]) => {
    const idx = barang.findIndex(b => b.nama === nama);
    return `<tr class="hover:bg-white/10 transition">
      <td class="px-4 py-3 font-medium">${nama}</td>
      <td class="px-4 py-3 text-center"><span class="bg-red-500/30 text-red-300 px-3 py-1 rounded-full text-xs font-bold">${data.unit}</span></td>
      <td class="px-4 py-3 text-right text-emerald-300">Rp ${data.hargaJual.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right text-red-300 font-semibold">Rp ${data.nilai.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-center">
        ${idx>=0?`<button data-action="keluar" data-index="${idx}" class="bg-red-500/30 hover:bg-red-500/50 text-red-300 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer">− Keluar Lagi</button>`:'<span class="text-white/30 text-xs">Dihapus</span>'}
      </td></tr>`;
  }).join('');
}

function renderRiwayat() {
  const tbody = document.getElementById('listRiwayat');
  const cariNama  = (document.getElementById('filterNama')?.value   || '').toLowerCase();
  const cariTipe  = document.getElementById('filterTipe')?.value    || '';
  const cariTgl   = document.getElementById('filterTanggal')?.value || '';

  let filtered = riwayat;
  if (cariNama) filtered = filtered.filter(r => r.nama.toLowerCase().includes(cariNama));
  if (cariTipe) filtered = filtered.filter(r => r.tipe === cariTipe);
  if (cariTgl) {
    const tglFormatted = new Date(cariTgl).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' });
    filtered = filtered.filter(r => r.waktu.includes(tglFormatted.slice(0,5)));
  }

  document.getElementById('emptyRiwayat').style.display = filtered.length ? 'none' : 'block';
  const warna = { masuk:'bg-emerald-500/30 text-emerald-300', keluar:'bg-red-500/30 text-red-300', jasa:'bg-orange-500/30 text-orange-300' };
  const label = { masuk:'📥 Masuk', keluar:'📤 Keluar', jasa:'⚙️ Jasa' };
  const teks  = { masuk:'text-emerald-300', keluar:'text-red-300', jasa:'text-orange-300' };
  tbody.innerHTML = filtered.map((r, i) => {
    const realIdx = riwayat.indexOf(r);
    return `<tr class="hover:bg-white/10 transition">
      <td class="px-4 py-3 text-white/50 text-xs whitespace-nowrap">${r.waktu}</td>
      <td class="px-4 py-3 font-medium">${r.nama}</td>
      <td class="px-4 py-3 text-center"><span class="px-3 py-1 rounded-full text-xs font-semibold ${warna[r.tipe]||warna.keluar}">${label[r.tipe]||r.tipe}</span></td>
      <td class="px-4 py-3 text-center font-bold ${teks[r.tipe]||''}">${r.jumlah}</td>
      <td class="px-4 py-3 text-right text-white/70">Rp ${r.hargaSatuan.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right font-semibold ${teks[r.tipe]||''}">Rp ${r.totalHarga.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-white/50 text-sm">${r.keterangan}</td>
      <td class="px-4 py-3 text-center">
        <button onclick="hapusRiwayat(${realIdx})" class="text-white/20 hover:text-red-300 hover:bg-red-500/20 px-2 py-1 rounded-lg text-xs transition cursor-pointer">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function resetFilterRiwayat() {
  document.getElementById('filterNama').value    = '';
  document.getElementById('filterTipe').value    = '';
  document.getElementById('filterTanggal').value = '';
  renderRiwayat();
}

// ── Laporan ───────────────────────────────────────────────────────────
function setPeriode(p) {
  periodeAktif = p;
  ['hari','minggu','bulan','semua'].forEach(x => {
    document.getElementById('btn' + x.charAt(0).toUpperCase() + x.slice(1)).className =
      'px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ' +
      (x === p ? 'bg-white text-purple-700 shadow' : 'bg-white/10 text-white/70 hover:bg-white/20');
  });
  renderLaporan();
}

function getRiwayatPeriode() {
  const now  = new Date();
  const hari = now.toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' });
  return riwayat.filter(r => {
    if (periodeAktif === 'semua') return true;
    const tgl = new Date(r.waktu.split(', ')[0].split('/').reverse().join('-'));
    if (periodeAktif === 'hari')   return r.waktu.startsWith(hari.slice(0,5));
    if (periodeAktif === 'minggu') return (now - tgl) <= 7 * 86400000;
    if (periodeAktif === 'bulan')  return tgl.getMonth() === now.getMonth() && tgl.getFullYear() === now.getFullYear();
    return true;
  });
}

function renderLaporan() {
  if (document.getElementById('panelLaporan').classList.contains('hidden')) return;
  const data    = getRiwayatPeriode();
  const masuk   = data.filter(r => r.tipe === 'masuk');
  const keluar  = data.filter(r => r.tipe === 'keluar');
  const jasaR   = data.filter(r => r.tipe === 'jasa');

  const nilaiMasuk  = masuk.reduce((s,r)=>s+r.totalHarga,0);
  const nilaiKeluar = keluar.reduce((s,r)=>s+r.totalHarga,0);
  const nilaiJasa   = jasaR.reduce((s,r)=>s+r.totalHarga,0);
  // Keuntungan kotor: (nilai jual keluar - nilai beli estimasi) + jasa
  const keuntungan  = nilaiKeluar - masuk.reduce((s,r)=>s+r.totalHarga,0) + nilaiJasa;

  document.getElementById('lapNilaiMasuk').textContent  = 'Rp ' + nilaiMasuk.toLocaleString('id-ID');
  document.getElementById('lapNilaiKeluar').textContent = 'Rp ' + nilaiKeluar.toLocaleString('id-ID');
  document.getElementById('lapNilaiJasa').textContent   = 'Rp ' + nilaiJasa.toLocaleString('id-ID');
  document.getElementById('lapKeuntungan').textContent  = 'Rp ' + keuntungan.toLocaleString('id-ID');
  document.getElementById('lapUnitMasuk').textContent   = masuk.reduce((s,r)=>s+r.jumlah,0) + ' unit';
  document.getElementById('lapUnitKeluar').textContent  = keluar.reduce((s,r)=>s+r.jumlah,0) + ' unit';
  document.getElementById('lapTrxJasa').textContent     = jasaR.length + ' transaksi';

  const labelPeriode = { hari:'Hari ini', minggu:'7 hari terakhir', bulan:'Bulan ini', semua:'Semua waktu' };
  document.getElementById('lapPeriodeLabel').textContent = labelPeriode[periodeAktif];

  const warna = { masuk:'text-emerald-300', keluar:'text-red-300', jasa:'text-orange-300' };
  const label = { masuk:'📥 Masuk', keluar:'📤 Keluar', jasa:'⚙️ Jasa' };
  document.getElementById('lapEmpty').style.display = data.length ? 'none' : 'block';
  document.getElementById('lapTabel').innerHTML = data.map(r => `
    <tr class="hover:bg-white/10 transition">
      <td class="px-4 py-3 text-white/50 text-xs whitespace-nowrap">${r.waktu}</td>
      <td class="px-4 py-3 font-medium">${r.nama}</td>
      <td class="px-4 py-3 text-center"><span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 ${warna[r.tipe]||''}">${label[r.tipe]||r.tipe}</span></td>
      <td class="px-4 py-3 text-center text-white/70">${r.jumlah}</td>
      <td class="px-4 py-3 text-right font-semibold ${warna[r.tipe]||''}">Rp ${r.totalHarga.toLocaleString('id-ID')}</td>
    </tr>`).join('');
}

// ── Notifikasi Stok Kritis ────────────────────────────────────────────
function renderNotifStok() {
  const kritis = barang.filter(b => b.stok <= 3);
  const notif  = document.getElementById('notifStokKritis');
  if (kritis.length === 0) { notif.classList.add('hidden'); return; }
  const habis = kritis.filter(b => b.stok === 0);
  let pesan = '';
  if (habis.length > 0) pesan += `${habis.length} barang habis stok. `;
  const tipis = kritis.filter(b => b.stok > 0);
  if (tipis.length > 0) pesan += `${tipis.length} barang stok tipis (≤3).`;
  document.getElementById('notifStokKritisText').textContent = '⚠️ ' + pesan;
  notif.classList.remove('hidden');
}

function renderSummary() {
  const masuk  = riwayat.filter(r => r.tipe === 'masuk');
  const keluar = riwayat.filter(r => r.tipe === 'keluar');
  const uMasuk  = masuk.reduce((s,r)=>s+r.jumlah,0);
  const uKeluar = keluar.reduce((s,r)=>s+r.jumlah,0);

  // Cards
  document.getElementById('sumJenisBarang2').textContent = barang.length;
  document.getElementById('sumStokTotal').textContent    = barang.reduce((s,b)=>s+b.stok,0);
  document.getElementById('sumUnitMasuk2').textContent   = uMasuk;
  document.getElementById('sumUnitKeluar2').textContent  = uKeluar;
  document.getElementById('sumNilaiMasuk').textContent   = 'Rp ' + masuk.reduce((s,r)=>s+r.totalHarga,0).toLocaleString('id-ID');
  document.getElementById('sumNilaiKeluar').textContent  = 'Rp ' + keluar.reduce((s,r)=>s+r.totalHarga,0).toLocaleString('id-ID');

  // Topbar mini
  document.getElementById('sumJenisBarang').textContent = barang.length;
  document.getElementById('sumUnitMasuk').textContent   = uMasuk;
  document.getElementById('sumUnitKeluar').textContent  = uKeluar;
}

function now() {
  return new Date().toLocaleString('id-ID', { dateStyle:'short', timeStyle:'short' });
}

// ── Export / Import ───────────────────────────────────────────────────
function exportData() {
  const data = { barang, jasa, riwayat, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const tgl  = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `bengkel-backup-${tgl}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.barang || !data.jasa || !data.riwayat) {
        alert('File tidak valid! Pastikan file backup yang benar.'); return;
      }
      barang  = data.barang;
      jasa    = data.jasa;
      riwayat = data.riwayat;
      simpanData();
      render();
      alert(`✅ Import berhasil!\n${barang.length} barang, ${jasa.length} jasa, ${riwayat.length} riwayat dimuat.`);
    } catch {
      alert('Gagal membaca file. Pastikan file adalah backup yang valid.');
    }
    event.target.value = ''; // reset input supaya bisa import file sama lagi
  };
  reader.readAsText(file);
}

// ── Event Listeners ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  muatData();
  document.getElementById('sidebarNamaBengkel').textContent = namaBengkel;
  switchTab('dashboard');
  render();
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const index  = parseInt(btn.dataset.index);
    if (action === 'masuk')     openModal(index, 'masuk');
    if (action === 'keluar')    openModal(index, 'keluar');
    if (action === 'edit')      openEdit(index);
    if (action === 'hapus')     hapusBarang(index);
    if (action === 'editJasa')  openEditJasa(index);
    if (action === 'hapusJasa') hapusJasa(index);
  });

  ['modalNota','modalSettingNama','modalHapusRiwayat','modalEditJasa','modalHapus','modalEdit','modalOverlay'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('click', e => { if (e.target === el) el.classList.add('hidden'); });
  });

  document.getElementById('modalJumlah').addEventListener('input', hitungModalTotal);
  document.getElementById('modalHarga').addEventListener('input', hitungModalTotal);
});
