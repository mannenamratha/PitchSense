import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Play,
  Save,
  Eye,
  EyeOff,
  Lightbulb,
  Target,
  Zap,
  FileText,
  Mic,
  ChevronRight,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  audience: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  features: string[];
  sections: TemplateSection[];
  tips: string[];
  examples: string[];
}

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  timeAllocation: string;
  questions: TemplateQuestion[];
}

interface TemplateQuestion {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
  required: boolean;
  helpText?: string;
}

interface TemplateFormProps {
  template: Template;
  onBack: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onBack }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [expandedTips, setExpandedTips] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (questionId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const validateSection = (sectionIndex: number): boolean => {
    const section = template.sections[sectionIndex];
    const sectionErrors: Record<string, string> = {};
    let isValid = true;

    section.questions.forEach(question => {
      if (question.required && !formData[question.id]?.trim()) {
        sectionErrors[question.id] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(prev => ({ ...prev, ...sectionErrors }));
    return isValid;
  };

  const handleNextSection = () => {
    if (validateSection(currentSection)) {
      setCompletedSections(prev => new Set([...prev, currentSection]));
      if (currentSection < template.sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const generatePitch = () => {
    const pitch = template.sections.map(section => {
      const sectionContent = section.questions
        .map(question => formData[question.id])
        .filter(Boolean)
        .join(' ');
      
      return sectionContent;
    }).filter(Boolean).join('\n\n');

    setGeneratedPitch(pitch);
    setShowPreview(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPitch);
  };

  const downloadPitch = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedPitch], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${template.title.replace(/\s+/g, '_')}_pitch.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getCompletionPercentage = () => {
    const totalQuestions = template.sections.reduce((sum, section) => sum + section.questions.length, 0);
    const answeredQuestions = Object.keys(formData).filter(key => formData[key]?.trim()).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const isFormComplete = () => {
    return template.sections.every(section => 
      section.questions.every(question => 
        !question.required || formData[question.id]?.trim()
      )
    );
  };

  const currentSectionData = template.sections[currentSection];
  const IconComponent = template.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Templates</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${template.bgGradient} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{template.title}</h1>
                  <p className="text-xs text-gray-500">{template.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {getCompletionPercentage()}% Complete
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${template.bgGradient} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Progress & Tips */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Progress */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Progress</h3>
                <div className="space-y-3">
                  {template.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentSection
                          ? `bg-gradient-to-r ${template.bgGradient} text-white`
                          : completedSections.has(index)
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentSection(index)}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === currentSection
                          ? 'bg-white/20'
                          : completedSections.has(index)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-white'
                      }`}>
                        {completedSections.has(index) ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{section.title}</p>
                        <p className={`text-xs ${
                          index === currentSection ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {section.timeAllocation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <button
                  onClick={() => setExpandedTips(!expandedTips)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span>Pro Tips</span>
                  </h3>
                  {expandedTips ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {expandedTips && (
                  <div className="space-y-3">
                    {template.tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-600">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Examples */}
              {template.examples.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>Examples</span>
                  </h3>
                  <div className="space-y-3">
                    {template.examples.map((example, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 italic">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            {!showPreview ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {/* Section Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-r ${template.bgGradient} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {currentSection + 1}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentSectionData.title}</h2>
                      <p className="text-gray-600">{currentSectionData.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Suggested time: {currentSectionData.timeAllocation}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{currentSectionData.questions.length} questions</span>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {currentSectionData.questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                        {question.helpText && (
                          <div className="group relative inline-block ml-2">
                            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              {question.helpText}
                            </div>
                          </div>
                        )}
                      </label>
                      
                      {question.type === 'textarea' ? (
                        <textarea
                          value={formData[question.id] || ''}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          placeholder={question.placeholder}
                          rows={4}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                            errors[question.id] ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                      ) : question.type === 'select' ? (
                        <select
                          value={formData[question.id] || ''}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors[question.id] ? 'border-red-300' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select an option...</option>
                          {question.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={question.type}
                          value={formData[question.id] || ''}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          placeholder={question.placeholder}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors[question.id] ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                      )}
                      
                      {errors[question.id] && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{errors[question.id]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePreviousSection}
                    disabled={currentSection === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-4">
                    {currentSection === template.sections.length - 1 ? (
                      <button
                        onClick={generatePitch}
                        disabled={!isFormComplete()}
                        className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${template.bgGradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>Generate Pitch</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleNextSection}
                        className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${template.bgGradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300`}
                      >
                        <span>Next Section</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Preview */
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Generated Pitch</h2>
                    <p className="text-gray-600">Ready to practice with PitchSense</p>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                    {generatedPitch}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Text</span>
                  </button>
                  
                  <button
                    onClick={downloadPitch}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // This would navigate to the practice page with the generated pitch
                      // For now, we'll just show an alert
                      alert('This would take you to the practice page with your generated pitch!');
                    }}
                    className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${template.bgGradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>Practice This Pitch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;