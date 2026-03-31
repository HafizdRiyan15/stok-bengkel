let barang = [];
let riwayat = [];
let modalState = { index: null, tipe: null };

// ── Tambah barang baru ──────────────────────────────────────────────
function tambahBarang() {
  const nama      = document.getElementById('nama').value.trim();
  const stokAwal  = parseInt(document.getElementById('stokAwal').value) || 0;
  const hargaBeli = parseInt(document.getElementById('hargaBeli').value);
  const hargaJual = parseInt(document.getElementById('hargaJual').value);

  if (!nama) { alert('Nama barang wajib diisi!'); return; }
  if (isNaN(hargaBeli) || hargaBeli < 0) { alert('Harga beli wajib diisi!'); return; }
  if (isNaN(hargaJual) || hargaJual < 0) { alert('Harga jual wajib diisi!'); return; }

  // Cek duplikat nama
  if (barang.some(b => b.nama.toLowerCase() === nama.toLowerCase())) {
    alert(`Barang "${nama}" sudah ada!`); return;
  }

  barang.push({ nama, stok: stokAwal, hargaBeli, hargaJual });

  if (stokAwal > 0) {
    riwayat.unshift({
      waktu: now(), nama, tipe: 'masuk',
      jumlah: stokAwal, hargaSatuan: hargaBeli,
      totalHarga: stokAwal * hargaBeli,
      keterangan: 'Stok awal'
    });
  }

  ['nama','stokAwal','hargaBeli','hargaJual'].forEach(id => document.getElementById(id).value = '');
  render();
}

// ── Hapus barang ────────────────────────────────────────────────────
function hapusBarang(i) {
  if (!confirm(`Hapus "${barang[i].nama}"?`)) return;
  barang.splice(i, 1);
  render();
}

// ── Buka modal ──────────────────────────────────────────────────────
function openModal(i, tipe) {
  modalState = { index: i, tipe };
  const item    = barang[i];
  const isMasuk = tipe === 'masuk';

  document.getElementById('modalTitle').textContent     = isMasuk ? '📥 Pemasukan Barang' : '📤 Pengeluaran Barang';
  document.getElementById('modalSubtitle').textContent  = `${item.nama} — stok saat ini: ${item.stok} unit`;
  document.getElementById('modalHargaLabel').textContent = isMasuk ? 'Harga Beli Satuan' : 'Harga Jual Satuan';
  document.getElementById('modalJumlah').value          = '';
  document.getElementById('modalHarga').value           = isMasuk ? item.hargaBeli : item.hargaJual;
  document.getElementById('modalKeterangan').value      = '';
  document.getElementById('modalTotal').textContent     = 'Rp 0';

  const btn = document.getElementById('modalConfirm');
  btn.className = 'flex-1 py-3 rounded-xl font-semibold transition cursor-pointer ' +
    (isMasuk ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-red-500 hover:bg-red-400 text-white');
  btn.textContent = isMasuk ? 'Catat Masuk' : 'Catat Keluar';

  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modalJumlah').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  modalState = { index: null, tipe: null };
}

// ── Hitung total realtime di modal ──────────────────────────────────
function hitungModalTotal() {
  const jumlah = parseInt(document.getElementById('modalJumlah').value) || 0;
  const harga  = parseInt(document.getElementById('modalHarga').value)  || 0;
  document.getElementById('modalTotal').textContent = 'Rp ' + (jumlah * harga).toLocaleString('id-ID');
}

// ── Konfirmasi transaksi ────────────────────────────────────────────
function konfirmasiTransaksi() {
  const jumlah = parseInt(document.getElementById('modalJumlah').value);
  const harga  = parseInt(document.getElementById('modalHarga').value);
  const ket    = document.getElementById('modalKeterangan').value.trim();
  const { index, tipe } = modalState;

  if (isNaN(jumlah) || jumlah <= 0) { document.getElementById('modalJumlah').focus(); return; }
  if (isNaN(harga)  || harga  <  0) { document.getElementById('modalHarga').focus();  return; }

  const item = barang[index];

  if (tipe === 'keluar' && jumlah > item.stok) {
    alert(`Stok tidak cukup! Stok tersedia: ${item.stok} unit`);
    return;
  }

  // Update stok & harga default
  if (tipe === 'masuk') {
    item.stok      += jumlah;
    item.hargaBeli  = harga;          // update harga beli terbaru
  } else {
    item.stok      -= jumlah;
    item.hargaJual  = harga;          // update harga jual terbaru
  }

  riwayat.unshift({
    waktu: now(), nama: item.nama, tipe,
    jumlah, hargaSatuan: harga,
    totalHarga: jumlah * harga,
    keterangan: ket || '-'
  });

  closeModal();
  render();
}

// ── Tab ─────────────────────────────────────────────────────────────
function switchTab(tab) {
  const tabs = ['stok', 'keluar', 'riwayat'];
  tabs.forEach(t => {
    document.getElementById('panel' + t.charAt(0).toUpperCase() + t.slice(1))
      .classList.toggle('hidden', t !== tab);
    document.getElementById('tab'   + t.charAt(0).toUpperCase() + t.slice(1)).className =
      'px-5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ' +
      (t === tab ? 'bg-white text-purple-700 shadow' : 'bg-white/10 text-white/70 hover:bg-white/20');
  });
}

// ── Render ──────────────────────────────────────────────────────────
function render() {
  renderTable();
  renderKeluar();
  renderRiwayat();
  renderSummary();
}

function renderKeluar() {
  const tbody = document.getElementById('listKeluar');
  const empty = document.getElementById('emptyKeluar');

  // Hitung total keluar per barang dari riwayat
  const keluarMap = {};
  riwayat.filter(r => r.tipe === 'keluar').forEach(r => {
    if (!keluarMap[r.nama]) keluarMap[r.nama] = { unit: 0, nilai: 0, hargaJual: 0 };
    keluarMap[r.nama].unit  += r.jumlah;
    keluarMap[r.nama].nilai += r.totalHarga;
    keluarMap[r.nama].hargaJual = r.hargaSatuan; // harga terakhir
  });

  const entries = Object.entries(keluarMap);
  empty.style.display = entries.length ? 'none' : 'block';

  const grandTotal = entries.reduce((s, [, v]) => s + v.nilai, 0);
  document.getElementById('grandTotalKeluar').textContent = 'Rp ' + grandTotal.toLocaleString('id-ID');

  // Cari index barang untuk tombol keluar
  tbody.innerHTML = entries.map(([nama, data]) => {
    const idx = barang.findIndex(b => b.nama === nama);
    return `
    <tr class="hover:bg-white/10 transition">
      <td class="px-4 py-3 font-medium">${nama}</td>
      <td class="px-4 py-3 text-center">
        <span class="bg-red-500/30 text-red-300 px-3 py-1 rounded-full text-xs font-bold">${data.unit}</span>
      </td>
      <td class="px-4 py-3 text-right text-emerald-300">Rp ${data.hargaJual.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right text-red-300 font-semibold">Rp ${data.nilai.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-center">
        ${idx >= 0 ? `<button data-action="keluar" data-index="${idx}"
          class="bg-red-500/30 hover:bg-red-500/50 text-red-300 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer">
          − Keluar Lagi
        </button>` : '<span class="text-white/30 text-xs">Barang dihapus</span>'}
      </td>
    </tr>`;
  }).join('');
}

function renderTable() {
  const tbody = document.getElementById('listBarang');
  document.getElementById('emptyState').style.display = barang.length ? 'none' : 'block';

  tbody.innerHTML = barang.map((item, i) => `
    <tr class="hover:bg-white/10 transition">
      <td class="px-4 py-3 font-medium">${item.nama}</td>
      <td class="px-4 py-3 text-center">
        <span class="px-3 py-1 rounded-full text-xs font-bold ${item.stok === 0 ? 'bg-red-500/30 text-red-300' : item.stok <= 3 ? 'bg-yellow-500/30 text-yellow-300' : 'bg-white/20 text-white'}">
          ${item.stok}
        </span>
      </td>
      <td class="px-4 py-3 text-right text-blue-300">Rp ${item.hargaBeli.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right text-emerald-300">Rp ${item.hargaJual.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right text-white/70">Rp ${(item.stok * item.hargaBeli).toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-center">
        <div class="flex gap-2 justify-center">
          <button data-action="masuk" data-index="${i}"
            class="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer">
            + Masuk
          </button>
          <button data-action="keluar" data-index="${i}"
            class="bg-red-500/30 hover:bg-red-500/50 text-red-300 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer">
            − Keluar
          </button>
        </div>
      </td>
      <td class="px-4 py-3 text-center">
        <button data-action="hapus" data-index="${i}"
          class="text-white/30 hover:text-red-300 hover:bg-red-500/20 px-3 py-1 rounded-lg text-xs transition cursor-pointer">
          Hapus
        </button>
      </td>
    </tr>
  `).join('');
}

function renderRiwayat() {
  const tbody = document.getElementById('listRiwayat');
  document.getElementById('emptyRiwayat').style.display = riwayat.length ? 'none' : 'block';

  tbody.innerHTML = riwayat.map(r => `
    <tr class="hover:bg-white/10 transition">
      <td class="px-4 py-3 text-white/50 text-xs whitespace-nowrap">${r.waktu}</td>
      <td class="px-4 py-3 font-medium">${r.nama}</td>
      <td class="px-4 py-3 text-center">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${r.tipe === 'masuk' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'}">
          ${r.tipe === 'masuk' ? '📥 Masuk' : '📤 Keluar'}
        </span>
      </td>
      <td class="px-4 py-3 text-center font-bold ${r.tipe === 'masuk' ? 'text-emerald-300' : 'text-red-300'}">
        ${r.tipe === 'masuk' ? '+' : '−'}${r.jumlah}
      </td>
      <td class="px-4 py-3 text-right text-white/70">Rp ${r.hargaSatuan.toLocaleString('id-ID')}</td>
      <td class="px-4 py-3 text-right font-semibold ${r.tipe === 'masuk' ? 'text-emerald-300' : 'text-red-300'}">
        Rp ${r.totalHarga.toLocaleString('id-ID')}
      </td>
      <td class="px-4 py-3 text-white/50 text-sm">${r.keterangan}</td>
    </tr>
  `).join('');
}

function renderSummary() {
  const masuk  = riwayat.filter(r => r.tipe === 'masuk');
  const keluar = riwayat.filter(r => r.tipe === 'keluar');

  const unitMasuk   = masuk.reduce((s, r)  => s + r.jumlah, 0);
  const unitKeluar  = keluar.reduce((s, r) => s + r.jumlah, 0);
  const nilaiMasuk  = masuk.reduce((s, r)  => s + r.totalHarga, 0);
  const nilaiKeluar = keluar.reduce((s, r) => s + r.totalHarga, 0);
  const stokTotal   = barang.reduce((s, b) => s + b.stok, 0);

  document.getElementById('sumJenisBarang').textContent = barang.length;
  document.getElementById('sumStokTotal').textContent   = stokTotal;
  document.getElementById('sumUnitMasuk').textContent   = unitMasuk;
  document.getElementById('sumUnitKeluar').textContent  = unitKeluar;
  document.getElementById('sumNilaiMasuk').textContent  = 'Rp ' + nilaiMasuk.toLocaleString('id-ID');
  document.getElementById('sumNilaiKeluar').textContent = 'Rp ' + nilaiKeluar.toLocaleString('id-ID');
}

// ── Helper ──────────────────────────────────────────────────────────
function now() {
  return new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

// Pasang event listener setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
  // Event delegation untuk tombol di tabel (fix bug onclick dengan kutip)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const index  = parseInt(btn.dataset.index);
    if (action === 'masuk')  openModal(index, 'masuk');
    if (action === 'keluar') openModal(index, 'keluar');
    if (action === 'hapus')  hapusBarang(index);
  });

  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.getElementById('modalJumlah').addEventListener('input', hitungModalTotal);
  document.getElementById('modalHarga').addEventListener('input', hitungModalTotal);
});
