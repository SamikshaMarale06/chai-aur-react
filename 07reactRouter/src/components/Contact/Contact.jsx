export default function Contact() {
    return (
        <div className="contact-page">
            <div className="contact-layout">
                <section className="contact-details">
                    <h1>Get in touch</h1>
                    <p>Fill in the form to start a conversation.</p>
                    <p>Acme Inc, Street, State, Postal Code</p>
                    <p>+44 1234567890</p>
                    <p>info@acme.org</p>
                </section>

                <form className="contact-form">
                    <div className="contact-field">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" name="name" id="name" placeholder="Full Name" />
                    </div>
                    <div className="contact-field">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" placeholder="Email" />
                    </div>
                    <div className="contact-field">
                        <label htmlFor="tel">Number</label>
                        <input type="tel" name="tel" id="tel" placeholder="Telephone Number" />
                    </div>
                    <button type="submit" className="simple-button">Submit</button>
                </form>
            </div>
        </div>
    )
}
