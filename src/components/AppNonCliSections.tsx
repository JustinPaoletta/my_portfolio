import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import Experience from '@/components/sections/Experience';
import GitHub from '@/components/sections/GitHub';
import Contact from '@/components/sections/Contact';
import PetDogs from '@/components/sections/PetDogs';

export default function AppNonCliSections(): React.ReactElement {
  return (
    <>
      <About />
      <Projects />
      <Skills />
      <Experience />
      <GitHub />
      <Contact />
      <PetDogs />
    </>
  );
}
