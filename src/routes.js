import Index from "views/Index.js";
import Settings from "views/Settings/settings.js";
import Graphic from "views/Graphics/graphic.js";
import { FirebaseProvider } from './services/FirebaseProvider.js';

var routes = [
  {
    path: "/index",
    name: "Home",
    icon: "ni ni-book-bookmark text-default",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/graphics",
    name: "Relatórios",
    icon: "ni ni-chart-pie-35 text-default",
    component: (
      <FirebaseProvider>
        <Graphic />
      </FirebaseProvider>
  ),
    layout: "/admin",
  },
  {
    path: "/settings",
    name: "Configurações",
    icon: "ni ni-single-02 text-default",
    component: (
        <FirebaseProvider>
          <Settings />
        </FirebaseProvider>
    ),
    layout: "/admin",
  },
];
export default routes;