"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Upload, Trash2, FileText, Video, Link2, Plus, X, BookOpen, Layers, MonitorPlay, ExternalLink, Download, FileJson, FileCode, CheckCircle2, Clock } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const TYPE_ICONS = { 
  pdf: <FileText className="h-5 w-5" />, 
  video: <MonitorPlay className="h-5 w-5" />, 
  link: <ExternalLink className="h-5 w-5" />, 
  document: <FileText className="h-5 w-5" />,
  image: <BookOpen className="h-5 w-5" />, 
  slides: <Layers className="h-5 w-5" />
};

const TYPE_COLORS = { 
  pdf: 'crimson', 
  video: 'indigo', 
  link: 'cyan', 
  document: 'blue', 
  image: 'pink', 
  slides: 'orange' 
};

export default function LecturerMaterials() {
  const { user, courses, materials, addMaterial, deleteMaterial } = useStore();
  const myCourses = courses.filter(c => c.lecturerId === user?.id);
  const myMaterials = materials.filter(m => m.uploadedBy === user?.id);
  const [showForm, setShowForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({ 
    courseId: '', title: '', type: 'pdf', url: '#', size: '', description: '' 
  });

  const filteredMaterials = filterCourse === 'all' ? myMaterials : myMaterials.filter(m => m.courseId === parseInt(filterCourse));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const fileUrl = URL.createObjectURL(file);
      setForm({ ...form, title: file.name.split('.')[0], size: sizeStr, url: fileUrl });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.courseId) return;
    addMaterial({ ...form, courseId: parseInt(form.courseId), uploadedBy: user.id, date: new Date().toLocaleDateString() });
    setForm({ courseId: '', title: '', type: 'pdf', url: '#', size: '', description: '' });
    setSelectedFile(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Academic Resource Vault</h1>
          <p className="text-muted-foreground mt-1 text-lg">Curate and distribute lecture materials, digital assets, and curriculum resources.</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 font-bold shadow-xl shadow-blue-600/20 rounded-xl px-6 h-12">
              <Plus className="mr-2 h-5 w-5" /> Provision Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl p-0 border-none shadow-2xl rounded-2xl overflow-hidden">
            <DialogTitle className="sr-only">Provision New Resource</DialogTitle>
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="bg-slate-900 text-white p-8">
                <CardTitle className="text-2xl font-black tracking-tight">Provision New Resource</CardTitle>
                <CardDescription className="text-slate-400">Initialize a digital asset for student access and curriculum synchronization.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Course</Label>
                       <select 
                         className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                         value={form.courseId} 
                         onChange={e => setForm({ ...form, courseId: e.target.value })} 
                         required
                       >
                          <option value="">Select target module...</option>
                          {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Asset Classification</Label>
                       <select 
                         className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                         value={form.type} 
                         onChange={e => setForm({ ...form, type: e.target.value })}
                       >
                          <option value="pdf">PDF / Academic Text</option>
                          <option value="document">Docx / Publication</option>
                          <option value="slides">Presentation Slides</option>
                          <option value="video">Multimedia / Lecture</option>
                          <option value="link">Institutional Web Link</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Resource Title</Label>
                    <Input 
                      placeholder="e.g. Week 4: Neural Network Fundamentals" 
                      className="h-10 rounded-xl focus-visible:ring-blue-600"
                      value={form.title} 
                      onChange={e => setForm({ ...form, title: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Resource Payload</Label>
                     <div className="relative group">
                        <input type="file" id="fac-file-upload" onChange={handleFileChange} className="hidden" />
                        <label 
                          htmlFor="fac-file-upload" 
                          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/10 transition-all duration-300"
                        >
                           <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="h-6 w-6 text-blue-600" />
                           </div>
                           <div className="text-center">
                              <p className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedFile ? selectedFile.name : 'Select File from Explorer'}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{selectedFile ? `Payload Size: ${form.size}` : 'All Institutional Formats Supported'}</p>
                           </div>
                        </label>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Context (Optional)</Label>
                    <Textarea 
                      placeholder="Brief description of the material's purpose..." 
                      className="rounded-xl focus-visible:ring-blue-600 resize-none min-h-[80px]"
                      value={form.description} 
                      onChange={e => setForm({ ...form, description: e.target.value })} 
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="ghost" className="flex-1 font-bold rounded-xl h-12" onClick={() => setShowForm(false)}>Abort</Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 font-black rounded-xl h-12 shadow-lg shadow-blue-600/20">Provision Asset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/40 p-2 overflow-hidden rounded-2xl">
         <div className="flex items-center gap-4 flex-wrap overflow-x-auto pb-1">
            <Button 
               variant={filterCourse === 'all' ? 'default' : 'ghost'} 
               size="sm" 
               className={`rounded-xl font-bold h-9 px-4 transition-all ${filterCourse === 'all' ? 'shadow-md shadow-slate-400/10' : 'text-muted-foreground'}`}
               onClick={() => setFilterCourse('all')}
            >
               Collective Inventory ({myMaterials.length})
            </Button>
            {myCourses.map(c => (
              <Button 
                key={c.id}
                variant={filterCourse === String(c.id) ? 'default' : 'ghost'} 
                size="sm" 
                className={`rounded-xl font-bold h-9 px-4 transition-all ${filterCourse === String(c.id) ? 'shadow-md shadow-slate-400/10' : 'text-muted-foreground'}`}
                onClick={() => setFilterCourse(String(c.id))}
              >
                 {c.code} ({myMaterials.filter(m => m.courseId === c.id).length})
              </Button>
            ))}
         </div>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.length === 0 ? (
          <div className="md:col-span-3 flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <FileCode className="h-16 w-16 text-slate-300 mb-4" />
            <p className="text-xl font-black text-slate-500 italic">No resources found in current filter.</p>
          </div>
        ) : (
          filteredMaterials.map(mat => {
            const course = courses.find(c => c.id === mat.courseId);
            return (
              <Card key={mat.id} className="group hover:border-blue-600/40 transition-all duration-500 shadow-sm hover:shadow-2xl border-none bg-card overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6">
                   <div className="p-3 rounded-2xl transition-all duration-500 group-hover:scale-110" style={{ backgroundColor: `${TYPE_COLORS[mat.type]}15`, color: TYPE_COLORS[mat.type] }}>
                      {TYPE_ICONS[mat.type]}
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
                        {mat.type} Payload
                     </Badge>
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{mat.size || 'N/A'}</span>
                   </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                   <div className="space-y-1">
                      <h4 className="text-lg font-black tracking-tight leading-tight line-clamp-1">{mat.title}</h4>
                      <div className="flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: course?.color }}></div>
                         <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: course?.color }}>{course?.code} — {course?.title}</span>
                      </div>
                   </div>
                   {mat.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                         {mat.description}
                      </p>
                   )}
                   <Separator className="bg-slate-100 dark:bg-slate-800" />
                   <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                         <Clock className="h-3.5 w-3.5" /> Synchronized {mat.date}
                      </div>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-destructive hover:text-white transition-colors" onClick={() => deleteMaterial(mat.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                         </Button>
                         <Button variant="outline" size="sm" className="h-8 font-black text-[10px] uppercase tracking-widest rounded-lg border-2" asChild>
                            <a href={mat.url} target="_blank" rel="noreferrer">Initialize Preview</a>
                         </Button>
                      </div>
                   </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
