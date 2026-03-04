import React from 'react';
import BackButton from '../components/BackButton';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <BackButton />
        <h1 className="about-title">About PlugFindr</h1>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            PlugFindr is dedicated to bridging the gap between campus vendors and students. 
            We provide a seamless platform for students to discover reliable services and products 
            while empowering student entrepreneurs and local vendors to grow their businesses.
            Our goal is to foster a vibrant campus economy built on trust, convenience, and community.
          </p>
        </section>

        <div className="legal-divider"></div>

        <section className="about-section">
          <h2>Terms and Conditions</h2>
          <p className="last-updated">Last Updated: January 24, 2026</p>
          
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using PlugFindr ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
            In addition, when using this Platform's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h3>2. User Accounts and Registration</h3>
          <p>
            To access certain features of the Platform, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process 
            and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and you agree not to disclose your password to any third party. 
            You are responsible for any activities or actions under your account, whether or not you have authorized such activities or actions. 
            PlugFindr reserves the right to terminate accounts that are inactive for an extended period or that violate our policies.
          </p>

          <h3>3. Vendor Responsibilities</h3>
          <p>
            Vendors on PlugFindr certify that they have the legal right to sell the products or services listed. 
            Vendors must ensure that all product descriptions, prices, and availability are accurate and up-to-date. 
            Misrepresentation of products or services is strictly prohibited and may result in immediate account suspension.
            Vendors are solely responsible for fulfilling orders and resolving customer service issues in a timely manner.
            PlugFindr acts as a facilitator and is not a party to the actual transaction between buyers and sellers.
          </p>

          <h3>4. Student/Buyer Responsibilities</h3>
          <p>
            Students and other buyers agree to use the Platform for lawful purposes only. 
            Harassment of vendors, posting of false reviews, or fraudulent activities are grounds for account termination.
            Buyers should exercise due diligence before making purchases. While PlugFindr verifies vendors, we cannot guarantee the quality or safety of every item or service listed.
          </p>

          <h3>5. Intellectual Property</h3>
          <p>
            The Platform and its original content, features, and functionality are owned by PlugFindr and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            Users retain ownership of content they upload (such as flyers or reviews) but grant PlugFindr a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content in connection with the Platform.
          </p>

          <h3>6. Limitation of Liability</h3>
          <p>
            In no event shall PlugFindr, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
            including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; 
            (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, 
            whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
          </p>
        </section>

        <div className="legal-divider"></div>

        <section className="about-section">
          <h2>Privacy & Legal Policy</h2>
          
          <h3>1. Data Collection and Usage</h3>
          <p>
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. 
            This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
            We use this data to facilitate transactions, improve our services, and communicate with you about updates and promotions.
          </p>

          <h3>2. Information Sharing</h3>
          <p>
            We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:
            Through the Platform: We may share your information with other Users to enable them to provide the Services you request. For example, we share your name and delivery location with the Vendor.
            We do not sell your personal data to third parties for direct marketing purposes.
          </p>

          <h3>3. Security</h3>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
            However, no internet transmission is completely secure, and we cannot guarantee the absolute security of your data.
          </p>

          <h3>4. Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
            Cookies are files with small amount of data which may include an anonymous unique identifier.
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
          </p>

          <h3>5. Changes to This Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>

          <h3>6. Contact Us</h3>
          <p>
            If you have any questions about these Terms or our Privacy Policy, please contact us at legal@plugfindr.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;

