import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import Experience from '@/components/sections/Experience';
import Articles from '@/components/sections/Articles';
import GitHub from '@/components/sections/GitHub';
import Contact from '@/components/sections/Contact';
import PetDogs from '@/components/sections/PetDogs';

export default function AppNonCliSections(): React.ReactElement {
  return (
    <>
      <About />
      <Projects />
      <Articles />
      <Experience />
      <Skills />
      <GitHub />
      <Contact />
      <PetDogs />
    </>
  );
}
