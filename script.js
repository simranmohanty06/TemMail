const emailAddressInput = document.getElementById('address');
const contentBox = document.getElementById('contentBox');

document.addEventListener('DOMContentLoaded', function () {
    contentBox.style.display = 'none';
    const emailAddress = emailAddressInput.value.trim();
    if (!emailAddress) {
        // If email address is not generated, call genEmail function
        genEmail();
    } else {
        // If email address is already generated, display it in the input field
        emailAddressInput.value = emailAddress;
        isEmailGenerated = true;
    }

    // Display emails immediately after DOMContentLoaded
    if (isEmailGenerated) {
        refreshMail();
    }
});

async function genEmail() {
    try {
        const response = await fetch("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1");
        const data = await response.json();
        emailAddressInput.value = data[0];
        refreshMail();
    } catch (error) {
        console.error('Error generating email:', error);
    }
}

async function refreshMail() {
    // alert("Refreshing emails...");
    const address = emailAddressInput.value;
    if (!address) {
        alert("Please generate or input an email address first!");
        return;
    }

    const user = address.split('@')[0];
    const domain = address.split('@')[1];

    try {
        const response = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${user}&domain=${domain}`);
        const emails = await response.json();

        if (emails.length !== 0) {
            const emailsTable = document.getElementById('emails');
            emailsTable.innerHTML = ''; // Clear the table before adding new rows
            // Add table headers
            const tableHTML = `
                <table class="table table-hover table-striped table-bordered text-center">
                    <tr>
                        <th><b>Sender</b></th>
                        <th><b>Subject</b></th>
                        <th><b>View</b></th>
                    </tr>
                </table>
            `;

            // Append the table structure to the emailsTable element
            emailsTable.innerHTML = tableHTML;

            // Get the reference to the tbody element inside the table
            const tbody = emailsTable.querySelector('tbody');

            // Loop through emails and add rows to the table
            emails.forEach(email => {
                // Create a new table row
                const row = document.createElement('tr');
                // Set the innerHTML of the row
                row.innerHTML = `
                    <td>${email.from}</td>
                    <td>${email.subject}</td>
                    <td id="${email.id}"><a href="#content"><i class="bi bi-eye-fill fs-3 text-primary" onclick="loadEmail('${email.id}')"></i></a></td>
                `;
                // Append the row to the tbody
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching emails:', error);
    }
}

async function loadEmail(id) {
    contentBox.style.display = 'block';
    const address = emailAddressInput.value;
    if (!address) {
        alert("Please generate or input an email address first!");
        return;
    }

    const user = address.split('@')[0];
    const domain = address.split('@')[1];

    try {
        const response = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${user}&domain=${domain}&id=${id}`);
        const email = await response.json();
        const from = document.getElementById('from');
        from.innerHTML = email.from;
        const subject = document.getElementById('subject');
        subject.innerHTML = email.subject;
        const date = document.getElementById('date');
        date.innerHTML = email.date;
        const content = document.getElementById('content');
        content.innerHTML = email.htmlBody || email.body;
        const files = document.getElementById('files');
        files.innerHTML = '';
        if(email.attachments) {
            email.attachments.forEach(file => {
                const link = document.createElement('a');
                link.href = `https://www.1secmail.com/api/v1/?action=download&login=${user}&domain=${domain}&id=${id}&file=${file.filename}`;
                link.textContent = file.filename;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                files.appendChild(link);
            })
        };

    } catch (error) {
        console.error('Error loading email:', error);
    }
}

function goBack() {
    from.innerHTML = 'Sender: ';
    subject.innerHTML = 'Subject: ';
    date.innerHTML = 'Date: ';
    // files.innerHTML = 'Attachments: ';
    contentBox.style.display = 'none';
}

function copyEmailAddress() {
    emailAddressInput.select(); // Select the text inside the input field
    document.execCommand('copy'); // Copy the selected text to clipboard
    alert('Email address copied to clipboard!');
}


setInterval(() => { refreshMail() }, 10000);
