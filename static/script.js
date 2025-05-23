// // Initialize PDF.js worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// // DOM Elements
// const fileInput = document.getElementById('fileInput');
// const uploadBtn = document.getElementById('uploadBtn');
// const dropArea = document.getElementById('dropArea');
// const progressContainer = document.getElementById('progressContainer');
// const progressBar = document.getElementById('progressBar');
// const progressText = document.getElementById('progressText');
// const rankBtn = document.getElementById('rankBtn');
// const searchInput = document.getElementById('searchInput');
// const sortSelect = document.getElementById('sortSelect');
// const exportBtn = document.getElementById('exportBtn');
// const resultsBody = document.getElementById('resultsBody');
// const noResults = document.getElementById('noResults');
// const previewModal = document.getElementById('previewModal');
// const closeBtn = document.querySelector('.close-btn');
// const modalBody = document.getElementById('modalBody');

// // State
// let uploadedResumes = [];
// let rankedResults = [];

// // Event Listeners
// uploadBtn.addEventListener('click', () => fileInput.click());
// fileInput.addEventListener('change', handleFileUpload);
// dropArea.addEventListener('dragover', handleDragOver);
// dropArea.addEventListener('drop', handleDrop);
// rankBtn.addEventListener('click', rankResumes);
// searchInput.addEventListener('input', filterResults);
// sortSelect.addEventListener('change', sortResults);
// exportBtn.addEventListener('click', exportResults);
// closeBtn.addEventListener('click', () => previewModal.style.display = 'none');
// window.addEventListener('click', (e) => {
//     if (e.target === previewModal) {
//         previewModal.style.display = 'none';
//     }
// });



// // Functions
// function handleDragOver(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     dropArea.style.borderColor = '#4361ee';
//     dropArea.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
// }

// function handleDragLeave() {
//     dropArea.style.borderColor = '#ccc';
//     dropArea.style.backgroundColor = 'transparent';
// }

// function handleDrop(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     handleDragLeave();
    
//     const files = e.dataTransfer.files;
//     if (files.length) {
//         fileInput.files = files;
//         handleFileUpload();
//     }
// }



// async function handleFileUpload() {
//     const files = fileInput.files;
//     if (!files.length) return;
    
//     progressContainer.style.display = 'block';
//     progressBar.style.width = '0%';
//     progressText.textContent = '0%';
    
//     for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         if (file.type !== 'application/pdf') {
//             alert('Please upload only PDF files');
//             continue;
//         }
        
//         try {
//             // Simulate upload progress
//             for (let percent = 0; percent <= 100; percent += 10) {
//                 await new Promise(resolve => setTimeout(resolve, 100));
//                 progressBar.style.width = `${percent}%`;
//                 progressText.textContent = `${percent}%`;
//             }
            
//             // Process the PDF file
//             const resumeData = await processPDF(file);
//             uploadedResumes.push(resumeData);
            
//             // Update UI
//             updateUploadStatus();
//         } catch (error) {
//             console.error('Error processing PDF:', error);
//             alert('Error processing PDF file');
//         }
//     }
    
//     setTimeout(() => {
//         progressContainer.style.display = 'none';
//         if (uploadedResumes.length > 0) {
//             rankBtn.disabled = false;
//         }
//     }, 500);
// }

// function updateUploadStatus() {
//     if (uploadedResumes.length > 0) {
//         noResults.style.display = 'none';
//     } else {
//         noResults.style.display = 'block';
//     }
// }

// async function rankResumes() {
//     if (uploadedResumes.length === 0) return;

//     try {
//         const res = await fetch('http://localhost:5000/score', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(uploadedResumes)
//         });

//         let scoredResumes = await res.json();

//         // Normalize scores between 0 and 1
//         const scores = scoredResumes.map(r => r.score);
//         const maxScore = Math.max(...scores);
//         const minScore = Math.min(...scores);

//         scoredResumes = scoredResumes.map(r => ({
//             ...r,
//             score: maxScore === minScore 
//                 ? 1 
//                 : parseFloat(((r.score - minScore) / (maxScore - minScore)).toFixed(2))
//         }));

//         rankedResults = scoredResumes;
//         displayResults();
//     } catch (error) {
//         console.error('Error scoring resumes:', error);
//         alert('Error scoring resumes');
//     }
// }


// function displayResults() {
//     resultsBody.innerHTML = '';
    
//     if (rankedResults.length === 0) {
//         noResults.style.display = 'block';
//         return;
//     }
    
//     noResults.style.display = 'none';
    
//     rankedResults.forEach((resume, index) => {
//         const row = document.createElement('tr');
//         if (index < 3) row.classList.add('top-candidate');
        
//         // Determine score class for styling
//         let scoreClass = 'score-medium';
//         if (resume.score >= 0.80) scoreClass = 'score-high';
//         else if (resume.score < 0.50) scoreClass = 'score-low';
        
//         row.innerHTML = `
//             <td>${index + 1}</td>
//             <td>${resume.name}</td>
//             <td class="${scoreClass}">${resume.score}</td>
//             <td>${resume.experience} ${resume.experience === 1 ? 'year' : 'years'}</td>
//             <td>${resume.education}</td>
//             <td>${resume.skills.join(', ')}</td>
//             <td><button class="view-btn" data-id="${resume.id}">View</button></td>
//         `;
        
//         resultsBody.appendChild(row);
//     });
    
//     // Add event listeners to view buttons
//     document.querySelectorAll('.view-btn').forEach(btn => {
//         btn.addEventListener('click', () => viewResume(btn.dataset.id));
//     });
// }

// function viewResume(resumeId) {
//     const resume = rankedResults.find(r => r.id === resumeId);
//     if (!resume) return;
    
//     modalBody.innerHTML = `
//         <h4>${resume.name}</h4>
//         <p><strong>Email:</strong> ${resume.email || 'Not specified'}</p>
//         <p><strong>Phone:</strong> ${resume.phone || 'Not specified'}</p>
//         <p><strong>Score:</strong> ${resume.score}</p>
//         <p><strong>Experience:</strong> ${resume.experience} ${resume.experience === 1 ? 'year' : 'years'}</p>
//         <p><strong>Education:</strong> ${resume.education}</p>
//         <p><strong>Skills:</strong> ${resume.skills.join(', ')}</p>
//         <div class="resume-preview">
//             <h5>Resume Content:</h5>
//             <div class="content-preview">${resume.textContent.substring(0, 1000)}...</div>
//         </div>
//     `;
    
//     previewModal.style.display = 'block';
// }

// function filterResults() {
//     const searchTerm = searchInput.value.toLowerCase();
    
//     if (!searchTerm) {
//         displayResults();
//         return;
//     }
    
//     const filtered = rankedResults.filter(resume => 
//         resume.name.toLowerCase().includes(searchTerm) ||
//         resume.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
//         resume.education.toLowerCase().includes(searchTerm)
//     );
    
//     resultsBody.innerHTML = '';
    
//     if (filtered.length === 0) {
//         noResults.style.display = 'block';
//         noResults.innerHTML = `
//             <i class="fas fa-search"></i>
//             <p>No results found for "${searchTerm}"</p>
//         `;
//         return;
//     }
    
//     noResults.style.display = 'none';
    
//     filtered.forEach((resume, index) => {
//         const row = document.createElement('tr');
        
//         // Determine score class for styling
//         let scoreClass = 'score-medium';
//         if (resume.score >= 0.80) scoreClass = 'score-high';
//         else if (resume.score < 0.50) scoreClass = 'score-low';
        
//         row.innerHTML = `
//             <td>${index + 1}</td>
//             <td>${resume.name}</td>
//             <td class="${scoreClass}">${resume.score}</td>
//             <td>${resume.experience} ${resume.experience === 1 ? 'year' : 'years'}</td>
//             <td>${resume.education}</td>
//             <td>${resume.skills.join(', ')}</td>
//             <td><button class="view-btn" data-id="${resume.id}">View</button></td>
//         `;
        
//         resultsBody.appendChild(row);
//     });
    
//     // Add event listeners to view buttons
//     document.querySelectorAll('.view-btn').forEach(btn => {
//         btn.addEventListener('click', () => viewResume(btn.dataset.id));
//     });
// }

// function sortResults() {
//     const sortBy = sortSelect.value;
    
//     if (sortBy === 'experience') {
//         rankedResults.sort((a, b) => b.experience - a.experience);
//     } else if (sortBy === 'education') {
//         // Simple education ranking
//         const educationRank = {
//             'PhD': 3,
//             'Master': 2,
//             'Bachelor': 1,
//             'Unknown': 0
//         };
        
//         rankedResults.sort((a, b) => {
//             const aRank = educationRank[a.education.split(' ')[0]] || 0;
//             const bRank = educationRank[b.education.split(' ')[0]] || 0;
//             return bRank - aRank;
//         });
//     } else {
//         // Default sort by score
//         rankedResults.sort((a, b) => b.score - a.score);
//     }
    
//     displayResults();
// }

// function exportResults() {
//     if (rankedResults.length === 0) {
//         alert('No results to export');
//         return;
//     }
    
//     // Convert to CSV
//     let csv = 'Rank,Name,Score,Experience,Education,Skills\n';
    
//     rankedResults.forEach((resume, index) => {
//         csv += `"${index + 1}","${resume.name}","${resume.score}","${resume.experience} years","${resume.education}","${resume.skills.join(', ')}"\n`;
//     });
    
//     // Create download link
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.setAttribute('hidden', '');
//     a.setAttribute('href', url);
//     a.setAttribute('download', 'resume_rankings.csv');
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
// }

// // Initialize
// updateUploadStatus();


