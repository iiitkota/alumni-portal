import { useState, useEffect } from "react";

import axios from "axios";

let APIHOST = import.meta.env.VITE_API_URL


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logoBase64 from "../assets/iiitkotalogo.png";

function DownloadAlumniPDFButton() {
    const [loading, setLoading] = useState(false);

    const [alumni, setAlumni] = useState([])
    const [status, setStatus] = useState("")
    const [appliedFilters] = useState({});

    const fetchAlumni = async () => {
        try {
            setStatus("Fetching List");
            const response = await axios.get(
                `${APIHOST}/api/admin/alumni`, 
                {
                params: {
                    page: 1,
                    limit: 10000,
                    ...appliedFilters,
                },
            }
            ); 
            setAlumni(response.data.alumni);
            setStatus("Fetching List Completed"); 
            return response.data.alumni;

        } catch (error) {
            console.error("Error fetching alumni data: ", error); 
            return [];
        } 
    };


    const generatePDF = async () => {
        setLoading(true);
        setStatus("Fetching Alumni Data");

        try {
            // --- CHANGE 3: Await the result and store it in a local variable ---
            const fetchedData = await fetchAlumni();

            // --- CHANGE 4: Check the local variable, not the state variable ---
            if (!fetchedData || fetchedData.length === 0) {
                setStatus("No alumni data found");
                setLoading(false);
                return;
            }

            setStatus("Generating PDF");

            const doc = new jsPDF("landscape");
            doc.addImage(logoBase64, "PNG", 14, 10, 30, 30);
            doc.setFontSize(18);
            doc.text("IIIT Kota Alumni List", 150, 25, { align: "center" });

            // --- CHANGE 5: Map over the local variable ---
            const body = fetchedData.map(alum => [
                alum.name || "",
                alum.instituteId || "",
                alum.branch || "",
                alum.graduationYear || "",
                alum.role || "",
                alum.currentCompany || "",
                alum.personalEmail || "",
                alum.phoneNumber || "",
                alum.linkedin || ""
            ]);

            autoTable(doc, {
                startY: 45,
                head: [["Name", "ID", "Branch", "Year", "Role", "Current Company", "Email", "Phone", "LinkedIn"]],
                body,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [255, 102, 0] },

                columnStyles: {
                    0: { cellWidth: 30 },    // Name
                    1: { cellWidth: 24 },    // ID
                    2: { cellWidth: 15 },    // Branch
                    3: { cellWidth: 15 },    // Year
                    4: { cellWidth: 35 },    // Role
                    5: { cellWidth: 35 },    // Company
                    6: { cellWidth: 45 },    // Email (needs more space)
                    7: { cellWidth: 25 },    // Phone
                    8: { cellWidth: 'auto' } // LinkedIn (let it fill remaining space)
                }
            });

            doc.save("alumni-list.pdf");
            setStatus("PDF Generated Successfully");

        } catch (error) {
            console.error("Error generating PDF:", error);
            setStatus("Error Generating PDF");
        } finally {
            setLoading(false);
        }
    };



    return (
        <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={generatePDF}
            disabled={loading}
        >
            {loading ? status : "Download Alumni List PDF"}
        </button>
    );
}




export function AlumniList() {

    const [alumni, setAlumni] = useState([])
    const [filters, setFilters] = useState({
        name: "",
        instituteId: "",
        graduationYear: "",
        company: "",
        role: "",
        branch: "",
        city: "",
    })

    const [currentPage, setCurrentPage] = useState(1);
    let [itemsPerPage, setItemsPerPage] = useState(20);
    let [totalPages, setTotalPages] = useState(1);
    let [totalCount, setTotalCount] = useState(0);
    let [loading, setLoading] = useState(1);

    let [appliedFilters, setAppliedFilters] = useState({});

    const fetchAlumni = async () => {
        try {
            const response = await axios.get(  
                `${APIHOST}/api/admin/alumni`, 
                {
                    params: {
                        page: currentPage,
                        limit: itemsPerPage,
                        ...appliedFilters,

                    }
                }
            );

            setAlumni(response.data.alumni);
            setTotalCount(response.data.totalCount);
            setTotalPages(response.data.totalPages);

            setLoading(true)

        } catch (error) {
            console.error("Error fetching alumni data: ", error);
        } finally {
            setLoading(false);
        }


    };

    useEffect(() => {

        fetchAlumni();
    }, [currentPage, itemsPerPage, appliedFilters])


    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setAppliedFilters({ ...filters }); // Trigger useEffect to re-fetch
        setCurrentPage(1); // Reset to page 1
    };


    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});

    const handleEdit = (alumnus) => {
        setEditingId(alumnus._id);
        setFormData({ ...alumnus });
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            let response = await axios.put(`${APIHOST}/api/admin/alumni/${editingId}`, formData);

            setAlumni((prev) =>
                prev.map((a) => (a._id === editingId ? formData : a))
            );

            setEditingId(null);
 
        } catch (error) {
            console.error("Failed to update alumnus:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            if (!window.confirm("Are you sure you want to delete this alumnus?")) return;

            await axios.delete(`${APIHOST}/api/admin/alumni/${id}`);

            setAlumni((prev) => prev.filter((a) => a._id !== id));
        } catch (error) {
            console.error("Failed to delete alumnus:", error);
        }
    };

    return (
        <div className=" " >


            {/* Search & Filters */}
            <div className="  flex flex-wrap gap-2 px-4 mt-6 mb-3 items-center text-sm">
                <input
                    placeholder="Name"
                    className="border p-1 rounded"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
                <input
                    placeholder="Institute ID"
                    className="border p-1 rounded"
                    value={filters.instituteId}
                    onChange={(e) => setFilters({ ...filters, instituteId: e.target.value })}
                />
                <input
                    placeholder="Graduation Year"
                    className="border p-1 rounded"
                    value={filters.graduationYear}
                    onChange={(e) => setFilters({ ...filters, graduationYear: e.target.value })}
                />
                <input
                    placeholder="Company"
                    className="border p-1 rounded"
                    value={filters.company}
                    onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                />
                <input
                    placeholder="Role"
                    className="border p-1 rounded"
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                />
                <input
                    placeholder="Branch"
                    className="border p-1 rounded"
                    value={filters.branch}
                    onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                />
                <input
                    placeholder="City"
                    className="border p-1 rounded"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
                <button
                    onClick={() => {
                        setAppliedFilters(
                            Object.fromEntries(
                                Object.entries(filters).filter(([_, v]) => v !== "")
                            )
                        );
                        setCurrentPage(1); // reset to first page when searching
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-full hover:opacity-80"
                >
                    Search
                </button>

                <button
                    onClick={() => {
                        setFilters({
                            name: "",
                            instituteId: "",
                            graduationYear: "",
                            company: "",
                            role: "",
                            branch: "",
                            city: "",
                        });
                        setAppliedFilters({});
                        setCurrentPage(1);
                    }}
                    className="px-3 py-1  text-black rounded-full bg-gray-200  hover:opacity-80 "
                >
                    Reset
                </button>
            </div>


            <div className="flex items-center" >

                <div className="text-sm flex items-center">
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mx-2 disabled:opacity-50"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>

                    <p>Page {currentPage} of {totalPages}</p>

                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mx-2 disabled:opacity-50"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>


                <div className="flex   px-4 text-sm items-center gap-2 mb-2">
                    <label htmlFor="itemsPerPage">Rows per page:</label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // reset to first page on change
                        }}
                        className="border p-1 rounded"
                    >
                        {[10, 20, 30, 50].map((num) => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>


                </div>

                <DownloadAlumniPDFButton />
            </div>



            <div className="overflow-x-scroll px-4" >
                <div className="mt-5 mb-1 ml-[120px] flex text-sm font-medium" >
                    <p className="min-w-[120px] max-w-[120px]" >Name</p>
                    <p className="min-w-[120px] max-w-[120px]">Linkedin</p>
                    <p className="min-w-[100px] max-w-[100px]" >Institute Id</p>
                    <p className="min-w-[60px] max-w-[60px]"  >Branch</p>
                    <p className="min-w-[60px] max-w-[60px]">Grad. Yr</p>
                    <p className="min-w-[120px] max-w-[120px]" >Role</p>
                    <p className="min-w-[120px] max-w-[120px]" >Current Company</p>
                    <p className="min-w-[90px] max-w-[90px]" >City</p>
                    <p className="min-w-[120px] max-w-[120px]">Email</p>
                    <p className="min-w-[90px] max-w-[90px]" >Phone. No.</p>
                    <p className="min-w-[100px] max-w-[100px]"  >Past Company</p>
                    <p className="min-w-[90px] max-w-[90px]" >State</p>
                    <p className="min-w-[90px] max-w-[90px]">Country</p>
                    <p>Achievements</p>

                </div>



                <div className={loading ? "opacity-70" : "opacity-100"} >


                    {
                        loading ? <div className='border mx-auto p-6 flex items-center justify-center h-[300px] rounded-2xl w-[80vw] border-2 border-white-100 bg-gray-200' >
                            <p className="text-center">Wait... Loading Alumni List...</p>

                        </div> : <div></div>
                    }
                    {alumni.map((alumnus) => (
                        <div key={alumnus._id} className="flex   items-center text-sm"  >

                            {/* Left side buttons */}
                            {editingId === alumnus._id ? (
                                <button
                                    onClick={handleSave}
                                    className="bg-green-500 text-white w-[50px] px-[5px] py-[1px] hover:opacity-80 rounded-full"
                                >
                                    Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleEdit(alumnus)}
                                    className=" bg-black text-white w-[50px] px-[5px] py-[1px] rounded-full hover:opacity-80 "
                                >

                                    Edit
                                </button>



                            )}

                            <button
                                onClick={() => handleDelete(alumnus._id)}
                                className="bg-red-600 text-white px-2 mx-2 rounded w-[54px] px-[7px] py-[1px] rounded-full hover:opacity-80"
                            >
                                Delete
                            </button>

                            {/* Editable/display fields */}

                            {editingId === alumnus._id ? (
                                <input
                                    className="p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] min-w-[120px] max-w-[120px]"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                            ) : (
                                <p className="p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] min-w-[120px] max-w-[120px]">{alumnus.name}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input
                                    className="p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] min-w-[120px] max-w-[120px] overflow-x-scroll"
                                    value={formData.linkedin}
                                    onChange={(e) => handleChange("linkedin", e.target.value)}
                                />
                            ) : (
                                <p className="p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] min-w-[120px] max-w-[120px] line-clamp-1 overflow-hidden">{alumnus.linkedin}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input className="min-w-[100px] max-w-[100px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.instituteId}
                                    onChange={(e) => handleChange("instituteId", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[100px] max-w-[100px] p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]" >{alumnus.instituteId}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input className="p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] min-w-[60px] max-w-[60px]"
                                    value={formData.branch}
                                    onChange={(e) => handleChange("branch", e.target.value)}
                                />
                            ) : (
                                <p className="p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] min-w-[60px] max-w-[60px]">{alumnus.branch}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input className="p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] min-w-[60px] max-w-[60px]"
                                    value={formData.graduationYear}
                                    onChange={(e) => handleChange("graduationYear", e.target.value)}
                                />
                            ) : (
                                <p className="p-[2px] bg-[#fcfcfc] border border-[#e2e2e2] min-w-[60px] max-w-[60px]" >{alumnus.graduationYear}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input
                                    className="min-w-[120px] max-w-[120px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.role}
                                    onChange={(e) => handleChange("role", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[120px] max-w-[120px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">{alumnus.role}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input
                                    className="min-w-[120px] max-w-[120px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.currentCompany}
                                    onChange={(e) => handleChange("currentCompany", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[120px] max-w-[120px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">{alumnus.currentCompany}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.city}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]" >{alumnus.city}</p>
                            )}

                            {/* New fields */}

                            {editingId === alumnus._id ? (
                                <input
                                    className="min-w-[120px] max-w-[120px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.personalEmail || ""}
                                    onChange={(e) => handleChange("personalEmail", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[120px] max-w-[120px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">{alumnus.personalEmail}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.phoneNumber || ""}
                                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">{alumnus.phoneNumber}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input
                                    className="min-w-[100] max-w-[100px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.pastCompanies || ""}
                                    onChange={(e) => handleChange("pastCompanies", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[100px] max-w-[100px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">{alumnus.pastCompanies}</p>
                            )}



                            {/* New: state */}
                            {editingId === alumnus._id ? (
                                <input className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.state || ""}
                                    onChange={(e) => handleChange("state", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]" >{alumnus.state}</p>
                            )}

                            {/* New: country */}
                            {editingId === alumnus._id ? (
                                <input className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.country || ""}
                                    onChange={(e) => handleChange("country", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]" >{alumnus.country}</p>
                            )}

                            {editingId === alumnus._id ? (
                                <input
                                    className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]"
                                    value={formData.achievements || ""}
                                    onChange={(e) => handleChange("achievements", e.target.value)}
                                />
                            ) : (
                                <p className="min-w-[90px] max-w-[90px] line-clamp-1 p-[2px] bg-[#fcfcfc] border border-[#e2e2e2]">{alumnus.achievements}</p>
                            )}


                        </div>
                    ))}

                </div>

            </div>




        </div>
    );
}
