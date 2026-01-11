/***********************
 * KONFIGURASI GITHUB *
 ***********************/
const OWNER = "SCPD-PRODUCTION";
const REPO = "kontrol-hafalan";
const FILE_PATH = "data/data.json";
const BRANCH = "main";

// ⚠️ TOKEN = KUNCI DIREKTORI (KAMU YANG TANGGUNG)
const TOKEN = "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";

/***********************
 * DATA APLIKASI
 ***********************/
let data = {
  siswa: [],
  setoran: []
};

/***********************
 * LOAD DATA DARI GITHUB
 ***********************/
async function loadData() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

  const res = await fetch(url);
  const json = await res.json();

  const decoded = atob(json.content);
  data = JSON.parse(decoded);

  renderSiswa();
  renderTabel();
}

loadData();

/***********************
 * PUSH DATA KE GITHUB
 ***********************/
async function pushKeGitHub() {
  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

  // ambil SHA terbaru
  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  });
  const file = await res.json();

  const contentBase64 = btoa(
    unescape(encodeURIComponent(JSON.stringify(data, null, 2)))
  );

  await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update data hafalan siswa",
      content: contentBase64,
      sha: file.sha,
      branch: BRANCH
    })
  });
}

/***********************
 * TAMBAH SISWA
 ***********************/
function tambahSiswa() {
  const nama = document.getElementById("namaSiswa").value.trim();
  const kelas = document.getElementById("kelas").value;

  if (!nama) {
    alert("Nama siswa wajib diisi");
    return;
  }

  data.siswa.push({ nama, kelas });
  document.getElementById("namaSiswa").value = "";

  renderSiswa();
  pushKeGitHub();

  alert("Siswa berhasil disimpan permanen");
}

/***********************
 * RENDER SISWA
 ***********************/
function renderSiswa() {
  const select = document.getElementById("pilihSiswa");
  select.innerHTML = "";

  data.siswa.forEach((s, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${s.nama} (${s.kelas})`;
    select.appendChild(opt);
  });
}

/***********************
 * TAMBAH SETORAN
 ***********************/
function tambahSetoran() {
  if (data.siswa.length === 0) {
    alert("Belum ada siswa");
    return;
  }

  const siswaIndex = document.getElementById("pilihSiswa").value;
  const jenis = document.getElementById("jenisSetoran").value;
  const materi = document.getElementById("materi").value.trim();
  const catatan = document.getElementById("catatan").value.trim();

  if (!materi) {
    alert("Materi wajib diisi");
    return;
  }

  data.setoran.push({
    siswa: data.siswa[siswaIndex].nama,
    jenis,
    materi,
    catatan,
    waktu: new Date().toLocaleString("id-ID")
  });

  document.getElementById("materi").value = "";
  document.getElementById("catatan").value = "";

  renderTabel();
  pushKeGitHub();

  alert("Setoran berhasil disimpan permanen");
}

/***********************
 * RENDER TABEL
 ***********************/
function renderTabel() {
  const tbody = document.getElementById("tabelSetoran");
  tbody.innerHTML = "";

  data.setoran.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.siswa}</td>
      <td>${s.jenis}</td>
      <td>${s.materi}</td>
      <td>${s.catatan}</td>
    `;
    tbody.appendChild(tr);
  });
}

/***********************
 * EXPORT PDF
 ***********************/
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  // logo dari repo GitHub
  pdf.addImage("assets/logo-sekolah.png", "PNG", 10, 10, 20, 20);
  pdf.addImage("assets/logo-kota.png", "PNG", 180, 10, 20, 20);

  pdf.setFontSize(14);
  pdf.text("LAPORAN HAFALAN SISWA", 60, 40);

  let y = 55;
  pdf.setFontSize(10);

  data.setoran.forEach(s => {
    pdf.text(
      `${s.siswa} | ${s.jenis} | ${s.materi} | ${s.catatan}`,
      10,
      y
    );
    y += 7;
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save("hafalan-siswa.pdf");
}
