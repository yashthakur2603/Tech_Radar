import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult } from '../shared/types';

export const generatePDFReport = async (result: AnalysisResult | null, targetRole: string = 'Target Role') => {
  if (!result) throw new Error('No result data exists to export');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });
  
  const margin = 40;
  let yPos = margin;
  const pageWidth = doc.internal.pageSize.width;
  const maxLineWidth = pageWidth - margin * 2;
  
  const writeText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setFontSize(options.size || 12);
    doc.setTextColor(options.color || '#333333');
    if (options.font) doc.setFont('helvetica', options.font);
    
    // Safety check just in case text is undefined or null
    const safeText = text || '';
    const lines = doc.splitTextToSize(safeText, options.maxWidth || maxLineWidth);
    
    if (y + (lines.length * (options.size || 12)) > doc.internal.pageSize.height - margin) {
      doc.addPage();
      y = margin;
    }
    
    doc.text(lines, x, y);
    return y + (lines.length * (options.size || 12) * 1.2) + (options.spacing || 0);
  };

  yPos = writeText('Tech Radar Pro - Strategic Insights', margin, yPos, { size: 24, font: 'bold', color: '#1E1B4B', spacing: 10 });
  yPos = writeText(`Target Role: ${targetRole} | Generated: ${new Date(result.run_date).toLocaleDateString()}`, margin, yPos, { size: 10, color: '#64748B', spacing: 30 });
  
  yPos = writeText('Profile Synergy', margin, yPos, { size: 16, font: 'bold', color: '#1E293B', spacing: 10 });
  yPos = writeText(result.current_profile_summary, margin, yPos, { size: 11, color: '#475569', spacing: 20 });
  
  yPos = writeText('Top 5 Recommended Skills:', margin, yPos, { size: 12, font: 'bold', color: '#1E293B', spacing: 5 });
  const skillsText = (result.top_5_next_skills || []).join(' • ');
  yPos = writeText(skillsText, margin, yPos, { size: 11, color: '#6366F1', font: 'bold', spacing: 30 });

  yPos = writeText('Capitalize On:', margin, yPos, { size: 18, font: 'bold', color: '#1E293B', spacing: 15 });
  
  (result.recommended_technologies || []).forEach((tech) => {
    const tableData = [
      ['Category', tech.category || 'N/A'],
      ['Priority', `${tech.priority || 'Medium'} Priority`],
      ['Learning Curve', tech.learning_difficulty || 'N/A'],
      ['Market Signal', tech.market_signal || 'N/A'],
      ['Salary Impact', tech.salary_impact || 'N/A'],
      ['Why It Matters', tech.why_relevant_for_me || 'N/A'],
      ['Project Idea', tech.project_idea || 'N/A'],
    ];

    if (yPos > doc.internal.pageSize.height - 100) {
      doc.addPage();
      yPos = margin;
    }

    yPos = writeText(tech.technology_name || 'Technology', margin, yPos, { size: 14, font: 'bold', color: '#312E81', spacing: 5 });
    yPos = writeText(tech.short_description || '', margin, yPos, { size: 10, color: '#475569', spacing: 10 });
    
    autoTable(doc, {
      startY: yPos,
      body: tableData,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100, fillColor: '#F8FAFC', textColor: '#334155' },
        1: { textColor: '#1E293B' }
      },
      didDrawPage: (data) => {
        if (data.cursor) yPos = data.cursor.y + 20;
      }
    });
  });

  doc.save('Tech_Radar_Strategic_Insights.pdf');
};
