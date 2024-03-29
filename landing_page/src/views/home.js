import React from 'react'

import { Helmet } from 'react-helmet'

import FeatureCard from '../components/feature-card'
import Question1 from '../components/question1'
import './home.css'

const Home = (props) => {
  return (
    <div className="home-container">
      <Helmet>
        <title>ChatGPTFirewall</title>
        <meta property="og:title" content="ChatGPTFirewall" />
      </Helmet>
      <div className="home-header">
        <header
          data-thq="thq-navbar"
          className="navbarContainer home-navbar-interactive"
        >
          <a href="https://chatgptfirewall.github.io/ChatGPTfirewall/">
            <img
              alt="image"
              src={`${process.env.PUBLIC_URL}/android-chrome-512x5121-200h.png`}
              className="home-image"
            />
          </a>
          <span className="logo">CHATGPTFIREWALL</span>
          <div data-thq="thq-navbar-nav" className="home-desktop-menu">
            <nav className="home-links">
              <a
                href="https://chatgptfirewall.github.io/ChatGPTfirewall/"
                className="home-nav12 bodySmall"
              >
                Home
              </a>
              <a
                href="https://chatgptfirewall.gitbook.io/chatgptfirewall/"
                target="_blank"
                rel="noreferrer noopener"
                className="home-nav22 bodySmall"
              >
                Documentation
              </a>
              <a href="#features" className="home-nav221 bodySmall">
                Features
              </a>
              <a href="#faq" className="home-nav222 bodySmall">
                FAQ
              </a>
              <a
                href="https://github.com/ChatGPTfirewall/ChatGPTfirewall"
                target="_blank"
                rel="noreferrer noopener"
                className="home-link1"
              >
                <div className="home-container01">
                  <span className="home-nav32 bodySmall">Github</span>
                  <svg
                    viewBox="0 0 877.7142857142857 1024"
                    className="home-icon"
                  >
                    <path d="M438.857 73.143c242.286 0 438.857 196.571 438.857 438.857 0 193.714-125.714 358.286-300 416.571-22.286 4-30.286-9.714-30.286-21.143 0-14.286 0.571-61.714 0.571-120.571 0-41.143-13.714-67.429-29.714-81.143 97.714-10.857 200.571-48 200.571-216.571 0-48-17.143-86.857-45.143-117.714 4.571-11.429 19.429-56-4.571-116.571-36.571-11.429-120.571 45.143-120.571 45.143-34.857-9.714-72.571-14.857-109.714-14.857s-74.857 5.143-109.714 14.857c0 0-84-56.571-120.571-45.143-24 60.571-9.143 105.143-4.571 116.571-28 30.857-45.143 69.714-45.143 117.714 0 168 102.286 205.714 200 216.571-12.571 11.429-24 30.857-28 58.857-25.143 11.429-89.143 30.857-127.429-36.571-24-41.714-67.429-45.143-67.429-45.143-42.857-0.571-2.857 26.857-2.857 26.857 28.571 13.143 48.571 64 48.571 64 25.714 78.286 148 52 148 52 0 36.571 0.571 70.857 0.571 81.714 0 11.429-8 25.143-30.286 21.143-174.286-58.286-300-222.857-300-416.571 0-242.286 196.571-438.857 438.857-438.857zM166.286 703.429c1.143-2.286-0.571-5.143-4-6.857-3.429-1.143-6.286-0.571-7.429 1.143-1.143 2.286 0.571 5.143 4 6.857 2.857 1.714 6.286 1.143 7.429-1.143zM184 722.857c2.286-1.714 1.714-5.714-1.143-9.143-2.857-2.857-6.857-4-9.143-1.714-2.286 1.714-1.714 5.714 1.143 9.143 2.857 2.857 6.857 4 9.143 1.714zM201.143 748.571c2.857-2.286 2.857-6.857 0-10.857-2.286-4-6.857-5.714-9.714-3.429-2.857 1.714-2.857 6.286 0 10.286s7.429 5.714 9.714 4zM225.143 772.571c2.286-2.286 1.143-7.429-2.286-10.857-4-4-9.143-4.571-11.429-1.714-2.857 2.286-1.714 7.429 2.286 10.857 4 4 9.143 4.571 11.429 1.714zM257.714 786.857c1.143-3.429-2.286-7.429-7.429-9.143-4.571-1.143-9.714 0.571-10.857 4s2.286 7.429 7.429 8.571c4.571 1.714 9.714 0 10.857-3.429zM293.714 789.714c0-4-4.571-6.857-9.714-6.286-5.143 0-9.143 2.857-9.143 6.286 0 4 4 6.857 9.714 6.286 5.143 0 9.143-2.857 9.143-6.286zM326.857 784c-0.571-3.429-5.143-5.714-10.286-5.143-5.143 1.143-8.571 4.571-8 8.571 0.571 3.429 5.143 5.714 10.286 4.571s8.571-4.571 8-8z"></path>
                  </svg>
                </div>
              </a>
            </nav>
            <div className="home-buttons">
              <a
                href="https://chatgpt.enclaive.io/"
                target="_blank"
                rel="noreferrer noopener"
                className="home-register buttonFilled"
              >
                Launch App
              </a>
            </div>
          </div>
          <div data-thq="thq-burger-menu" className="home-burger-menu">
            <svg viewBox="0 0 1024 1024" className="home-icon02 socialIcons">
              <path d="M128 554.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667zM128 298.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667zM128 810.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667z"></path>
            </svg>
          </div>
          <div
            data-thq="thq-mobile-menu"
            className="home-mobile-menu1 mobileMenu"
          >
            <div className="home-nav">
              <div className="home-top">
                <span className="logo">CHATGPTFIREWALL</span>
                <div data-thq="thq-close-menu" className="home-close-menu">
                  <svg
                    viewBox="0 0 1024 1024"
                    className="home-icon04 socialIcons"
                  >
                    <path d="M810 274l-238 238 238 238-60 60-238-238-238 238-60-60 238-238-238-238 60-60 238 238 238-238z"></path>
                  </svg>
                </div>
              </div>
              <nav className="home-links1">
                <span className="home-nav121 bodySmall">Home</span>
                <span className="home-nav223 bodySmall">How It Works</span>
                <span className="home-nav321 bodySmall">Security</span>
                <span className="home-nav42 bodySmall">FAQ</span>
                <span className="home-nav52 bodySmall">Contact</span>
              </nav>
              <div className="home-buttons1">
                <button className="buttonFlat">Login</button>
                <button className="buttonFilled">Register</button>
              </div>
            </div>
            <div>
              <svg
                viewBox="0 0 950.8571428571428 1024"
                className="home-icon06 socialIcons"
              >
                <path d="M925.714 233.143c-25.143 36.571-56.571 69.143-92.571 95.429 0.571 8 0.571 16 0.571 24 0 244-185.714 525.143-525.143 525.143-104.571 0-201.714-30.286-283.429-82.857 14.857 1.714 29.143 2.286 44.571 2.286 86.286 0 165.714-29.143 229.143-78.857-81.143-1.714-149.143-54.857-172.571-128 11.429 1.714 22.857 2.857 34.857 2.857 16.571 0 33.143-2.286 48.571-6.286-84.571-17.143-148-91.429-148-181.143v-2.286c24.571 13.714 53.143 22.286 83.429 23.429-49.714-33.143-82.286-89.714-82.286-153.714 0-34.286 9.143-65.714 25.143-93.143 90.857 112 227.429 185.143 380.571 193.143-2.857-13.714-4.571-28-4.571-42.286 0-101.714 82.286-184.571 184.571-184.571 53.143 0 101.143 22.286 134.857 58.286 41.714-8 81.714-23.429 117.143-44.571-13.714 42.857-42.857 78.857-81.143 101.714 37.143-4 73.143-14.286 106.286-28.571z"></path>
              </svg>
              <svg
                viewBox="0 0 877.7142857142857 1024"
                className="home-icon08 socialIcons"
              >
                <path d="M585.143 512c0-80.571-65.714-146.286-146.286-146.286s-146.286 65.714-146.286 146.286 65.714 146.286 146.286 146.286 146.286-65.714 146.286-146.286zM664 512c0 124.571-100.571 225.143-225.143 225.143s-225.143-100.571-225.143-225.143 100.571-225.143 225.143-225.143 225.143 100.571 225.143 225.143zM725.714 277.714c0 29.143-23.429 52.571-52.571 52.571s-52.571-23.429-52.571-52.571 23.429-52.571 52.571-52.571 52.571 23.429 52.571 52.571zM438.857 152c-64 0-201.143-5.143-258.857 17.714-20 8-34.857 17.714-50.286 33.143s-25.143 30.286-33.143 50.286c-22.857 57.714-17.714 194.857-17.714 258.857s-5.143 201.143 17.714 258.857c8 20 17.714 34.857 33.143 50.286s30.286 25.143 50.286 33.143c57.714 22.857 194.857 17.714 258.857 17.714s201.143 5.143 258.857-17.714c20-8 34.857-17.714 50.286-33.143s25.143-30.286 33.143-50.286c22.857-57.714 17.714-194.857 17.714-258.857s5.143-201.143-17.714-258.857c-8-20-17.714-34.857-33.143-50.286s-30.286-25.143-50.286-33.143c-57.714-22.857-194.857-17.714-258.857-17.714zM877.714 512c0 60.571 0.571 120.571-2.857 181.143-3.429 70.286-19.429 132.571-70.857 184s-113.714 67.429-184 70.857c-60.571 3.429-120.571 2.857-181.143 2.857s-120.571 0.571-181.143-2.857c-70.286-3.429-132.571-19.429-184-70.857s-67.429-113.714-70.857-184c-3.429-60.571-2.857-120.571-2.857-181.143s-0.571-120.571 2.857-181.143c3.429-70.286 19.429-132.571 70.857-184s113.714-67.429 184-70.857c60.571-3.429 120.571-2.857 181.143-2.857s120.571-0.571 181.143 2.857c70.286 3.429 132.571 19.429 184 70.857s67.429 113.714 70.857 184c3.429 60.571 2.857 120.571 2.857 181.143z"></path>
              </svg>
              <svg
                viewBox="0 0 602.2582857142856 1024"
                className="home-icon10 socialIcons"
              >
                <path d="M548 6.857v150.857h-89.714c-70.286 0-83.429 33.714-83.429 82.286v108h167.429l-22.286 169.143h-145.143v433.714h-174.857v-433.714h-145.714v-169.143h145.714v-124.571c0-144.571 88.571-223.429 217.714-223.429 61.714 0 114.857 4.571 130.286 6.857z"></path>
              </svg>
            </div>
          </div>
        </header>
      </div>
      <div className="home-hero">
        <div className="heroContainer home-hero1">
          <img
            src={`${process.env.PUBLIC_URL}/android-chrome-512x5121-200h.png`}
            alt="image"
            className="home-image1"
          />
          <div className="home-container02">
            <h1 className="home-hero-heading heading1">
              Secure File-Based Chatting with ChatGPTFirewall
            </h1>
            <div className="home-btn-group">
              <a
                href="https://chatgpt.enclaive.io/"
                target="_blank"
                rel="noreferrer noopener"
                className="home-hero-button1 buttonFilled"
              >
                Get Started Now
              </a>
              <a
                href="https://chatgptfirewall.gitbook.io/chatgptfirewall/"
                target="_blank"
                rel="noreferrer noopener"
                className="home-hero-button2 buttonFlat"
              >
                Learn More →
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="home-features">
        <div className="featuresContainer">
          <div id="features" className="home-features1">
            <div className="home-container03">
              <span className="overline">
                <span>features</span>
                <br></br>
              </span>
              <h2 className="home-features-heading heading2">
                Advanced Security Features
              </h2>
            </div>
            <div className="home-container04">
              <FeatureCard
                heading="Secure Communication"
                subHeading="ChatGPTFirewall ensures secure communication between the user and ChatGPT"
              ></FeatureCard>
              <FeatureCard
                heading="File-Based Chatting"
                subHeading="Chat with your files by uploading them and asking questions about their content"
              ></FeatureCard>
              <FeatureCard
                heading="Pseudonymized Data"
                subHeading="Sensitive data is pseudonymized to ensure privacy and security between you and ChatGPT"
              ></FeatureCard>
              <FeatureCard
                heading="Secure Data Processing"
                subHeading="Ensuring user data protection through operation in a secure enclave of confidential computing"
              ></FeatureCard>
            </div>
          </div>
        </div>
      </div>
      <div className="home-banner">
        <div className="bannerContainer home-banner1">
          <h1 className="home-banner-heading heading2">
            Chat with your files securely without exposing sensitive information
            to ChatGPT
          </h1>
          <a
            href="https://chatgptfirewall.gitbook.io/chatgptfirewall/"
            target="_blank"
            rel="noreferrer noopener"
            className="home-banner-button buttonFilled"
          >
            Learn More
          </a>
        </div>
      </div>
      <div className="home-faq">
        <div className="faqContainer">
          <div id="faq" className="home-faq1">
            <div className="home-container05">
              <h2 className="home-text3 heading2">FAQ</h2>
              <span className="home-text4 bodyLarge">
                <span>Here are some of the most common questions.</span>
                <br></br>
              </span>
            </div>
            <div className="home-container06">
              <Question1
                answer="ChatGPTFirewall is a web application designed to enable secure, private interactions with data. It facilitates a conversational interface for users to handle their data with enhanced confidentiality."
                question="What is ChatGPTFirewall?"
              ></Question1>
              <Question1
                answer="ChatGPTFirewall operates within a secure enclave of a confidential computing environment. It anonymizes sensitive information through pseudonymization, ensuring that the actual content remains inaccessible even during processing."
                question="How does ChatGPTFirewall ensure data security?"
              ></Question1>
              <Question1
                answer="ChatGPTFirewall allows users to upload documents, manage these in separate rooms, and ask questions about the content. The application provides responses from a large language model, taking context from the uploaded documents into account."
                question="What functionalities does ChatGPTFirewall offer?"
              ></Question1>
              <Question1
                answer="Yes, ChatGPTFirewall prioritizes the safety of your personal data. It employs specific techniques like named entity recognition to identify and pseudonymize personal information, replacing it with neutral placeholders before any processing occurs, effectively safeguarding your privacy."
                question="Is my personal data safe with ChatGPTFirewall?"
              ></Question1>
            </div>
          </div>
        </div>
      </div>
      <div className="home-footer">
        <footer className="footerContainer home-footer1">
          <div className="home-container07">
            <div className="home-container08">
              <div className="home-container09">
                <div className="home-container10">
                  <img
                    alt="image"
                    src={`${process.env.PUBLIC_URL}/android-chrome-512x5121-200h.png`}
                    className="home-image2"
                  />
                  <span className="logo">ChatGPTFIREWALL</span>
                </div>
                <nav className="home-nav1">
                  <a
                    href="https://chatgptfirewall.github.io/ChatGPTfirewall/"
                    className="home-nav122 bodySmall"
                  >
                    Home
                  </a>
                  <a
                    href="https://chatgptfirewall.gitbook.io/chatgptfirewall/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="home-nav224 bodySmall"
                  >
                    Documentation
                  </a>
                  <a href="#features" className="home-nav225 bodySmall">
                    Features
                  </a>
                  <a href="#faq" className="home-nav226 bodySmall">
                    FAQ
                  </a>
                  <a
                    href="https://github.com/ChatGPTfirewall/ChatGPTfirewall"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="home-link2"
                  >
                    <div className="home-container11">
                      <span className="home-nav322 bodySmall">Github</span>
                      <svg
                        viewBox="0 0 877.7142857142857 1024"
                        className="home-icon12"
                      >
                        <path d="M438.857 73.143c242.286 0 438.857 196.571 438.857 438.857 0 193.714-125.714 358.286-300 416.571-22.286 4-30.286-9.714-30.286-21.143 0-14.286 0.571-61.714 0.571-120.571 0-41.143-13.714-67.429-29.714-81.143 97.714-10.857 200.571-48 200.571-216.571 0-48-17.143-86.857-45.143-117.714 4.571-11.429 19.429-56-4.571-116.571-36.571-11.429-120.571 45.143-120.571 45.143-34.857-9.714-72.571-14.857-109.714-14.857s-74.857 5.143-109.714 14.857c0 0-84-56.571-120.571-45.143-24 60.571-9.143 105.143-4.571 116.571-28 30.857-45.143 69.714-45.143 117.714 0 168 102.286 205.714 200 216.571-12.571 11.429-24 30.857-28 58.857-25.143 11.429-89.143 30.857-127.429-36.571-24-41.714-67.429-45.143-67.429-45.143-42.857-0.571-2.857 26.857-2.857 26.857 28.571 13.143 48.571 64 48.571 64 25.714 78.286 148 52 148 52 0 36.571 0.571 70.857 0.571 81.714 0 11.429-8 25.143-30.286 21.143-174.286-58.286-300-222.857-300-416.571 0-242.286 196.571-438.857 438.857-438.857zM166.286 703.429c1.143-2.286-0.571-5.143-4-6.857-3.429-1.143-6.286-0.571-7.429 1.143-1.143 2.286 0.571 5.143 4 6.857 2.857 1.714 6.286 1.143 7.429-1.143zM184 722.857c2.286-1.714 1.714-5.714-1.143-9.143-2.857-2.857-6.857-4-9.143-1.714-2.286 1.714-1.714 5.714 1.143 9.143 2.857 2.857 6.857 4 9.143 1.714zM201.143 748.571c2.857-2.286 2.857-6.857 0-10.857-2.286-4-6.857-5.714-9.714-3.429-2.857 1.714-2.857 6.286 0 10.286s7.429 5.714 9.714 4zM225.143 772.571c2.286-2.286 1.143-7.429-2.286-10.857-4-4-9.143-4.571-11.429-1.714-2.857 2.286-1.714 7.429 2.286 10.857 4 4 9.143 4.571 11.429 1.714zM257.714 786.857c1.143-3.429-2.286-7.429-7.429-9.143-4.571-1.143-9.714 0.571-10.857 4s2.286 7.429 7.429 8.571c4.571 1.714 9.714 0 10.857-3.429zM293.714 789.714c0-4-4.571-6.857-9.714-6.286-5.143 0-9.143 2.857-9.143 6.286 0 4 4 6.857 9.714 6.286 5.143 0 9.143-2.857 9.143-6.286zM326.857 784c-0.571-3.429-5.143-5.714-10.286-5.143-5.143 1.143-8.571 4.571-8 8.571 0.571 3.429 5.143 5.714 10.286 4.571s8.571-4.571 8-8z"></path>
                      </svg>
                    </div>
                  </a>
                </nav>
              </div>
            </div>
          </div>
          <div className="home-separator"></div>
        </footer>
      </div>
    </div>
  )
}

export default Home
