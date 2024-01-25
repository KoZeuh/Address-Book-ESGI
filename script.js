const formatDateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
const pageSize = 4;
const contactTable = $("#contactList");

let currentPage = 1;
let filteredContacts = [];

// format "dd/mm/yyyy"
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', formatDateOptions);
}

function getTotalContacts() {
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    return contacts.length;
}

function updatePagination() {
    let totalContacts = getTotalContacts();
    let totalPages = Math.ceil(totalContacts / pageSize);

    $("#pagination").find(".page-item").removeClass("active");

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            $("#pagination").find('a:contains("' + i + '")').parent().addClass("active");
        }
    }
}

function loadContacts() {
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = startIndex + pageSize;
    let paginatedContacts = contacts.slice(startIndex, endIndex);

    let searchInput = $("#searchInput").val().toLowerCase();

    // Filtrage des contacts pour la recherche
    filteredContacts = contacts.filter(contact => {
        return (
            contact.firstName.toLowerCase().includes(searchInput) ||
            contact.lastName.toLowerCase().includes(searchInput) ||
            contact.phone.includes(searchInput)
        );
    });

    paginatedContacts = filteredContacts.slice(startIndex, endIndex);

    contactTable.empty();

    $.each(paginatedContacts, function (index, contact) {
        let tableRow = $('<tr>');

        tableRow.append('<td>' + contact.gender + '</td>');
        tableRow.append('<td>' + contact.firstName + '</td>');
        tableRow.append('<td>' + contact.lastName + '</td>');
        tableRow.append('<td>' + contact.phone + '</td>');
        tableRow.append('<td>' + formatDate(contact.updatedAt) + '</td>');

        let buttonsContainer = $('<td>');
        let buttons = $('<div class="btn-group">');

        buttons.append('<button class="editContact btn btn-warning" data-index="' + (startIndex + index) + '"><i class="fas fa-edit"></i></button>');
        buttons.append('<button class="deleteContact btn btn-danger" data-index="' + (startIndex + index) + '"><i class="fas fa-trash"></i></button>');

        buttonsContainer.append(buttons);
        tableRow.append(buttonsContainer);
        contactTable.append(tableRow);
    });

    updatePagination();
}

function saveContact(firstName, lastName, phone, gender) {
    let currentDate = new Date().toISOString();
    let contact = {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        gender: gender,
        updatedAt: currentDate
    };

    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    contacts.push(contact);

    localStorage.setItem("contacts", JSON.stringify(contacts));

    loadContacts();
    $("#contactForm")[0].reset();
}

function editContact(index) {
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    let contact = contacts[index];

    $("#firstName").val(contact.firstName);
    $("#lastName").val(contact.lastName);
    $("#phone").val(contact.phone);
    $("#gender").val(contact.gender);
    $("#contactForm").slideDown();

    $("#toggleForm").prop("disabled", true);
    $("#saveContact").data("editIndex", index);
}

function finishEditContact(index) {
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    let editedContact = {
        firstName: $("#firstName").val(),
        lastName: $("#lastName").val(),
        phone: $("#phone").val(),
        gender: $("#gender").val(),
        updatedAt: new Date().toISOString()
    };


    contacts[index] = editedContact;
    localStorage.setItem("contacts", JSON.stringify(contacts));

    $("#contactForm")[0].reset();
    $("#contactForm").slideUp();
    $("#toggleForm").prop("disabled", false);
    $("#saveContact").removeData("editIndex");

    loadContacts();
}

function deleteContact(index) {
    const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    contacts.splice(index, 1);
    localStorage.setItem("contacts", JSON.stringify(contacts));
    loadContacts();
}

$(document).ready(function () {
    loadContacts();

    $("#searchInput").on("input", function () {
        currentPage = 1;
        loadContacts();
    });
    
    $("#toggleForm").on("click", function () {
        $("#contactForm").slideToggle();
        $("#saveContact").removeData("editIndex");
        $("#contactForm")[0].reset();
    });

    $("#saveContact").on("click", function () {
        let editIndex = $(this).data("editIndex");

        let firstName = $("#firstName").val();
        let lastName = $("#lastName").val();
        let phone = $("#phone").val();
        let gender = $("#gender").val();

        if (firstName === "" || firstName.length < 2) {
            return alert("Veuillez saisir un prénom");
        } else if (lastName === "" || lastName.length < 2) {
            return alert("Veuillez saisir un nom");
        } else if (phone === "" || phone.length < 10) {
            return alert("Veuillez saisir un numéro de téléphone valide !");
        }

        if (editIndex !== undefined) {
            finishEditContact(editIndex);
        } else {
            saveContact(firstName, lastName, phone, gender);
        }
    });

    $(document).on("click", ".editContact", function () {
        let index = $(this).data("index");
        editContact(index);
    });

    $(document).on("click", ".deleteContact", function () {
        let index = $(this).data("index");
        deleteContact(index);
    });

    $("#prevPage").on("click", function () {
        if (currentPage > 1) {
            currentPage--;
            loadContacts();
        }

        if (currentPage < 1) {
            currentPage = 1;
        }
    });

    $("#nextPage").on("click", function () {
        let totalContacts = getTotalContacts();
        let totalPages = Math.ceil(totalContacts / pageSize);

        if (currentPage < totalPages) {
            currentPage++;
            loadContacts();
        }else if (currentPage > totalPages) {
            currentPage = totalPages;
        }
    });
});
