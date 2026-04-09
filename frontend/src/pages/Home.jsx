import HeroSection from "../components/HeroSection";
import HomeFeatures from "../components/HomeFeatures";
import HomeIntro from "../components/HomeIntro";
import HomeAudience from "../components/HomeAudience";  

export default function Home() {
  return (
    <>
      <HeroSection />
      <HomeIntro />
      <HomeFeatures />
      <HomeAudience />
    </>
  );
}
