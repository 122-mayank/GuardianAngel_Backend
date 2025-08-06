document.getElementById("submit").addEventListener("click", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("Please enter your email");
        return;
    }

    const response = await fetch("https://guardian-backend.vercel.app/api/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
        alert(data.message);
    } else {
        alert("Error: " + data.message);
    }
});
