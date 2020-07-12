import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TracingDashboardModule } from '@hypertrace/distributed-tracing';
import { ApplicationFrameModule } from './application-frame/application-frame.module';
import { ConfigModule } from './config.module';
import { RootComponent } from './root.component';
import { RootRoutingModule } from './routes/root-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RootRoutingModule,
    ConfigModule,
    HttpClientModule,
    ApplicationFrameModule,
    TracingDashboardModule
  ],
  declarations: [RootComponent],
  bootstrap: [RootComponent]
})
export class RootModule {}
