document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const addItemForm = document.getElementById("addItemForm");
    const itemTable = document.getElementById("itemTable");
    const searchInput = document.getElementById("searchInput");
    const logoutBtn = document.getElementById("logoutBtn");
    const addItemBtn = document.getElementById("addItemBtn");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const downloadExcelBtn = document.getElementById("downloadExcelBtn");
    const downloadWordBtn = document.getElementById("downloadWordBtn");
    const modalTitle = document.getElementById("modalTitle");
    const submitBtn = document.getElementById("submitBtn");
    const deleteConfirmModal = document.getElementById("deleteConfirmModal");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    let users = [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "user", password: "user123", role: "user" }
    ];

    let items = JSON.parse(localStorage.getItem("items")) || [];
    let itemToDeleteIndex = null;

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                if (user.role === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "user.html";
                }
            } else {
                alert("Invalid username or password");
            }
        });
    }


    function populateTable() {
        if (!itemTable) return;
        itemTable.innerHTML = "";
        const filteredItems = items.filter(item => 
            item.nama.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        filteredItems.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.kode}</td>
                <td>${item.nama}</td>
                <td>${item.jumlah}</td>
                <td>${item.status}</td>
                ${user.role === "admin" ? `<td>
                    <button class="btn btn-primary btn-sm editBtn" data-index="${index}">Edit</button>
                    <button class="btn btn-danger btn-sm deleteBtn" data-index="${index}">Delete</button>
                </td>` : ""}
            `;
            itemTable.appendChild(row);
        });

        if (user.role === "admin") {
            document.querySelectorAll(".editBtn").forEach((btn) => {
                btn.addEventListener("click", () => editItem(btn.dataset.index));
            });

            document.querySelectorAll(".deleteBtn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    itemToDeleteIndex = btn.dataset.index;
                    $('#deleteConfirmModal').modal('show');
                });
            });
        }
    }

    function saveItems() {
        localStorage.setItem("items", JSON.stringify(items));
    }

    populateTable();

    if (addItemForm) {
        addItemForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const kode = document.getElementById("kodeBarang").value;
            const nama = document.getElementById("namaBarang").value;
            const jumlah = document.getElementById("jumlahBarang").value;
            const status = document.getElementById("statusBarang").value;
            const index = document.getElementById("editIndex").value;

            if (index) {
                // Update item
                items[index] = { kode, nama, jumlah, status };
                document.getElementById("editIndex").value = '';
                submitBtn.textContent = 'Tambah';
                modalTitle.textContent = 'Tambah Barang';
            } else {
                // Add new item
                items.push({ kode, nama, jumlah, status });
            }

            saveItems();
            populateTable();
            $('#addItemModal').modal('hide');
            addItemForm.reset();
        });
    }

    function editItem(index) {
        const item = items[index];
        document.getElementById("kodeBarang").value = item.kode;
        document.getElementById("namaBarang").value = item.nama;
        document.getElementById("jumlahBarang").value = item.jumlah;
        document.getElementById("statusBarang").value = item.status;
        document.getElementById("editIndex").value = index;
        submitBtn.textContent = 'Simpan';
        modalTitle.textContent = 'Edit Barang';
        $('#addItemModal').modal('show');
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", function () {
            if (itemToDeleteIndex !== null) {
                items.splice(itemToDeleteIndex, 1);
                saveItems();
                populateTable();
                $('#deleteConfirmModal').modal('hide');
                itemToDeleteIndex = null;
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", populateTable);
    }

    if (addItemBtn) {
        addItemBtn.addEventListener("click", function() {
            addItemForm.reset();
            document.getElementById("editIndex").value = '';
            submitBtn.textContent = 'Tambah';
            modalTitle.textContent = 'Tambah Barang';
            $('#addItemModal').modal('show');
        });
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", () => {
            const doc = new jsPDF();
            doc.text("Data Barang", 10, 10);
            doc.autoTable({
                head: [['Kode Barang', 'Nama Barang', 'Jumlah Barang', 'Status Barang']],
                body: items.map(item => [item.kode, item.nama, item.jumlah, item.status]),
            });
            doc.save("data-barang.pdf");
        });
    }

    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener("click", () => {
            const ws = XLSX.utils.json_to_sheet(items);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data Barang");
            XLSX.writeFile(wb, "data-barang.xlsx");
        });
    }

    if (downloadWordBtn) {
        downloadWordBtn.addEventListener("click", () => {
            const doc = new docx.Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new docx.Paragraph({
                                text: "Data Barang",
                                heading: docx.HeadingLevel.HEADING_1,
                            }),
                            new docx.Table({
                                rows: [
                                    new docx.TableRow({
                                        children: [
                                            new docx.TableCell({ children: [new docx.Paragraph("Kode Barang")] }),
                                            new docx.TableCell({ children: [new docx.Paragraph("Nama Barang")] }),
                                            new docx.TableCell({ children: [new docx.Paragraph("Jumlah Barang")] }),
                                            new docx.TableCell({ children: [new docx.Paragraph("Status Barang")] }),
                                        ],
                                    }),
                                    ...items.map(item => 
                                        new docx.TableRow({
                                            children: [
                                                new docx.TableCell({ children: [new docx.Paragraph(item.kode)] }),
                                                new docx.TableCell({ children: [new docx.Paragraph(item.nama)] }),
                                                new docx.TableCell({ children: [new docx.Paragraph(item.jumlah.toString())] }),
                                                new docx.TableCell({ children: [new docx.Paragraph(item.status)] }),
                                            ],
                                        })
                                    ),
                                ],
                            }),
                        ],
                    },
                ],
            });
            docx.Packer.toBlob(doc).then(blob => {
                saveAs(blob, "data-barang.docx");
            });
        });
    }
});
