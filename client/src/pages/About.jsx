import Navbar from "../components/navbar.jsx";
import iiitkotalogo from "../assets/iiitkotalogo.png"; // Update path as needed
import Footer from "../components/Footer.jsx";
import ProfileCard from "../components/TeamCard.jsx";
import Hiteshwar from "../assets/hiteshwar_kk.jpeg";
import Kratin from "../assets/kratin_agarwal_img.jpeg";
import Chetna from "../assets/chetna_ma'am.jpeg";
import Partik from "../assets/partik_malasi.jpeg";
import Dean from "../../public/assets/dean.png";

import Dhiraj from "../assets/dhirajKushwaha.png"
import Arijit from "../assets/arijitAjayKumar.png"
import Nitesh from "../assets/niteshDixit.png"
import Mahak from "../assets/mahakGupta.png"
import Prachi from "../assets/prachiGupta.png"




const profiles = [
  {
    name: "Hiteshwar Kaushik",
    occupation: "4th Year CSE",
    image: Hiteshwar,
    linkedin: "https://www.linkedin.com/in/hiteshwarkaushik/",
    github: "https://www.github.com/coderkaushik",
    email: "hiteshwarkaushik@gmail.com",
  },
  {
    name: "Partik Malasi",
    occupation: "4th Year CSE",
    image: Partik,
    linkedin: "https://www.linkedin.com/in/partik-malasi-736686249/",
    github: "https://github.com/PartikMalasi",
    email: "partik.work@gmail.com",
  },
  {
    name: "Kratin Aggrawal",
    occupation: "4th Year CSE",
    image: Kratin,
    linkedin: "https://www.linkedin.com/in/kratin-aggarwal-691157257/",
    github: "https://www.github.com/coderkaushik",
    email: "kratin@example.com",
  },

  {
    name:"Arijit Ajay Kumar",
    occupation: "3rd Year CSE",
    image: Arijit,
    linkedin:"https://www.linkedin.com/in/arijitajaykumar/",
    github:"https://github.com/techAkki-CMD",
    email:"arijitajay.kumar@gmail.com"
  },

  {
    name:"Nitesh Dixit",
    occupation: "3rd Year ECE",
    image: Nitesh,
    linkedin:"https://www.linkedin.com/in/nitesh-kumar-680525290/",
    github:"https://github.com/FlopCoder35",
    email:"niteshdixit8957@gmail.com"
  },

   
  {
    name:"Dhiraj Kushwaha",
    occupation: "2nd Year AIDE",
    image: Dhiraj,
    linkedin:"https://www.linkedin.com/in/dhirajkushwaha/",
    github:"https://github.com/dhirajkushwaha",
    email:"dhirajk.contact@gmail.com"
  },

  {
    name:"Mahak Gupta",
    occupation: "2nd Year CSE",
    image: Mahak,
    linkedin:"https://www.linkedin.com/in/mahak-gupta-718a86323/",
    github:"https://github.com/MahakGupta390",
    email:"mahakgupta985@gmail"
  },

  {
    name:"Prachi Gupta",
    occupation: "2nd Year CSE",
    image: Prachi,
    linkedin:"https://www.linkedin.com/in/prachi-gupta-74122a324",
    github:"https://github.com/Prachi-Gupta2808",
    email:"prachig2808@gmail.com"
  } 

];

const About = () => {
  const teamMembers = [
    { name: "John Doe", role: "Coordinator", image: "/path/to/image.jpg" },
    {
      name: "Jane Smith",
      role: "Alumni Relations",
      image: "/path/to/image.jpg",
    },
    // Add more team members as needed
  ];

  return (
    <div className="w-full h-full overflow-x-hidden custom-scrollbar bg-gray-100">
      <Navbar />
      <div className="w-screen overflow-y-scroll custom-scrollbar mt-[10rem] flex flex-col items-center justify-center">
        {/* About Us Section */}
        <div className="flex flex-col h-[32rem] items-center text-center space-y-2 mt-2 max-w-2xl px-4 mb-12">
          <img
            src={iiitkotalogo}
            alt="IIIT Kota Logo"
            className="w-1/2 max-w-xs rounded-lg mb-4"
            loading="eager"
          />
          <h1 className="text-2xl md:text-3xl font-bold">
            Alumni and Industry Outreach, IIIT Kota
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Connecting students with industry leaders and alumni to foster
            growth and career opportunities.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="w-full bg-[#19194D] flex justify-center items-center px-4 md:px-[5rem] py-12">
          <section className="flex flex-col items-center text-center space-y-10 w-full px-4 md:px-8 py-12 shadow-lg rounded-lg bg-white">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              What We Do
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl">
              The Alumni Cell of IIIT Kota is dedicated to fostering a lifelong
              connection between the institute's alumni and its students. We
              organize initiatives that bridge the gap between academia and the
              professional world, creating meaningful engagement opportunities
              that help students develop their careers, gain insights, and build
              a robust network of support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Mentorship Programs
                </h3>
                <p className="text-lg text-gray-700">
                  Our mentorship programs connect current students with IIIT Kota alumni, allowing students to receive one-on-one guidance, advice, and industry-specific insights. Alumni mentors share their experiences, offering advice on academic pursuits, project ideas, skill-building, and navigating early career challenges.
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Networking Opportunities
                </h3>
                <p className="text-lg text-gray-700">
                  We host networking events where students can interact with alumni from diverse industries and backgrounds. These events are designed to provide a platform for knowledge exchange, foster professional connections, and give students a chance to understand industry expectations and trends directly from those already established in their fields.
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Career Talks & Workshops
                </h3>
                <p className="text-lg text-gray-700">
                  Our Alumni Cell organizes regular career talks and workshops led by alumni who have excelled in various domains. These sessions provide students with an in-depth understanding of industry landscapes, emerging fields, and valuable insights into different career paths. Alumni share their journeys, challenges, and tips, helping students make informed career choices.
                </p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Alumni Portal
                </h3>
                <p className="text-lg text-gray-700">
                  We are developing a comprehensive online alumni portal to facilitate communication and resource sharing between alumni and current students. The portal allows alumni to stay connected with their alma mater, view job postings, offer guidance, and engage with students through forums, articles, and scheduled interactions.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Our Team Section */}
        <div className="w-full bg-gray-100 flex justify-center items-center py-12">
          <section className="flex flex-col items-center text-center space-y-8 px-4 max-w-7xl w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Our Team
            </h2>

            {/* Dean and Associate Dean Cards on the Same Level */}
            <div className="flex justify-center items-center flex-col">
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mt-6">
                Leadership
              </h3>
              <p className="text-lg md:text-xl font-semibold text-gray-700">
                (Alumni and Industry Outreach)
              </p>
            </div>
            <div className="w-full flex justify-center items-center flex-wrap gap-8 mb-12">
              {/* Dean's Card */}
              <ProfileCard
                name="Dr. Manish Vashistha"
                occupation="Dean, Alumni and Industry Outreach"
                image={Dean} // Using the same image as Associate Dean for now
                linkedin="https://www.linkedin.com/in/example-dean/" // Placeholder
                email="dean@iiitkota.ac.in" // Placeholder
              />
              {/* Associate Dean's Card */}
              <ProfileCard
                name="Dr. Chetna Sharma"
                occupation="Associate Dean, Alumni and Industry Outreach"
                image={Chetna}
                linkedin="https://www.linkedin.com/in/chetna-sharma-phd-8ba8a337/"
                email="chetna.ece@iiitkota.ac.in"
              />
            </div>

            {/* Student Coordinators Subheading and Cards */}
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mt-12">
              Student Coordinators
            </h3>
            <div className="w-full flex justify-center items-center flex-wrap gap-8">
              {profiles.map((member, index) => (
                <ProfileCard key={index} {...member} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
